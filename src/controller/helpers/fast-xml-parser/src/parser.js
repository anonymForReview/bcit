const he = require('he');
const getAllMatches = require('./util').getAllMatches;

const xmlNode = function (tagname, parent, val){
  this.tagname = tagname;
  this.parent = parent;
  this.child = [];
  this.val = val;
  this.addChild = function (child){
    this.child.push(child);
  };
};

// var tagsRegx = new RegExp("<(\\/?[a-zA-Z0-9_:]+)([^>\\/]*)(\\/?)>([^<]+)?","g");
// var tagsRegx = new RegExp("<(\\/?[\\w:-]+)([^>]*)>([^<]+)?","g");
// var cdataRegx = "<!\\[CDATA\\[([^\\]\\]]*)\\]\\]>";
const cdataRegx = '<!\\[CDATA\\[(.*?)(\\]\\]>)';
const tagsRegx = new RegExp(`<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*${cdataRegx})*([^<]+)?`, 'g');

const defaultOptions = {
  attrPrefix: '@_',
  attrNodeName: false,
  textNodeName: '#text',
  ignoreNonTextNodeAttr: true,
  ignoreTextNodeAttr: true,
  ignoreNameSpace: false,
  ignoreRootElement: false,
  textNodeConversion: true,
  textAttrConversion: false,
  arrayMode: false,
};

const buildOptions = function (options){
  if (!options) options = {};
  const props = ['attrPrefix', 'attrNodeName', 'ignoreNonTextNodeAttr', 'ignoreTextNodeAttr', 'ignoreNameSpace', 'ignoreRootElement', 'textNodeName', 'textNodeConversion', 'textAttrConversion', 'arrayMode'];
  for (let i = 0; i < props.length; i++) {
    if (options[props[i]] === undefined){
      options[props[i]] = defaultOptions[props[i]];
    }
  }
  return options;
};

const getTraversalObj = function (xmlData, options){
  options = buildOptions(options);
  // xmlData = xmlData.replace(/>(\s+)/g, ">");//Remove spaces and make it single line.
  xmlData = xmlData.replace(/<!--(.|\n)*?-->/g, '');// Remove single and multiline comments
  const tags = getAllMatches(xmlData, tagsRegx);
  // console.log(tags);
  const xmlObj = new xmlNode('!xml');
  let currentNode = xmlObj;

  for (let i = 0; i < tags.length; i++) {
    var tag = resolveNameSpace(tags[i][1], options.ignoreNameSpace),
      nexttag = i + 1 < tags.length ? resolveNameSpace(tags[i + 1][1], options.ignoreNameSpace) : undefined,
      attrsStr = tags[i][2],
      attrs,
      val = tags[i][4] === undefined ? tags[i][6] : simplifyCDATA(tags[i][0]);
    if (tag.indexOf('/') === 0){ // ending tag
      currentNode = currentNode.parent;
      continue;
    }

    const selfClosingTag = attrsStr.charAt(attrsStr.length - 1) === '/';
    const childNode = new xmlNode(tag, currentNode);

    if (selfClosingTag){
      attrs = buildAttributesArr(attrsStr, options.ignoreTextNodeAttr, options.attrPrefix, options.attrNodeName, options.ignoreNameSpace, options.textAttrConversion);
      childNode.val = attrs || '';
      currentNode.addChild(childNode);
    } else if ((`/${tag}`) === nexttag){ // Text node
      attrs = buildAttributesArr(attrsStr, options.ignoreTextNodeAttr, options.attrPrefix, options.attrNodeName, options.ignoreNameSpace, options.textAttrConversion);
      val = parseValue(val, options.textNodeConversion);
      if (attrs){
        attrs[options.textNodeName] = val;
        childNode.val = attrs;
      } else {
        childNode.val = val;
      }
      currentNode.addChild(childNode);
      i++;
    } else if ((nexttag && nexttag.indexOf('/') === -1) && (val !== undefined && val != null && val.trim() !== '')){ // Text node with sub nodes
      val = parseValue(val, options.textNodeConversion);
      childNode.addChild(new xmlNode(options.textNodeName, childNode, val));
      currentNode.addChild(childNode);
      currentNode = childNode;
    } else { // starting tag
      attrs = buildAttributesArr(attrsStr, options.ignoreNonTextNodeAttr, options.attrPrefix, options.attrNodeName, options.ignoreNameSpace, options.textAttrConversion);
      if (attrs){
        for (const prop in attrs) {
          if (attrs.hasOwnProperty(prop)){
            childNode.addChild(new xmlNode(prop, childNode, attrs[prop]));
          }
        }
      }
      currentNode.addChild(childNode);
      currentNode = childNode;
    }
  }
  return xmlObj;
};

const xml2json = function (xmlData, options){
  return convertToJson(getTraversalObj(xmlData, options), buildOptions(options).arrayMode);
};

const cdRegx = new RegExp(cdataRegx, 'g');

function simplifyCDATA(cdata){
  const result = getAllMatches(cdata, cdRegx);
  let val = '';
  for (let i = 0; i < result.length; i++) {
    val += result[i][1];
  }
  return val;
}

function resolveNameSpace(tagname, ignore){
  if (ignore){
    const tags = tagname.split(':');
    const prefix = tagname.charAt(0) === '/' ? '/' : '';
    if (tags.length === 2) {
      if (tags[0] === 'xmlns') {
        return '';
      }
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}

function parseValue(val, conversion, isAttribute){
  if (val){
    if (!conversion || isNaN(val)){
      val = `${he.decode(val, { isAttributeValue: isAttribute, strict: true })}`;
      if (isAttribute) {
        val = val.replace(/\r?\n/g, ' ');
      }
    } else if (val.indexOf('.') !== -1){
      if (parseFloat){
        val = parseFloat(val);
      } else {
        val = Number.parseFloat(val);
      }
    } else if (parseInt){
      val = parseInt(val, 10);
    } else {
      val = Number.parseInt(val, 10);
    }
  } else {
    val = '';
  }
  return val;
}

const attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2", 'gm');
function buildAttributesArr(attrStr, ignore, prefix, attrNodeName, ignoreNS, conversion){
  attrStr = attrStr || attrStr.trim();

  if (!ignore && attrStr.length > 3){
    const matches = getAllMatches(attrStr, attrsRegx);
    const attrs = {};
    for (let i = 0; i < matches.length; i++) {
      const attrName = resolveNameSpace(matches[i][1], ignoreNS);
      if (attrName.length && attrName !== 'xmlns') {
        attrs[prefix + attrName] = parseValue(matches[i][3], conversion, true);
      }
    }
    if (!Object.keys(attrs).length){
      return;
    }
    if (attrNodeName){
      const attrCollection = {};
      attrCollection[attrNodeName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}

var convertToJson = function (node, arrayMode){
  const jObj = {};
  if (node.val !== undefined && node.val != null || node.val === '') {
    return node.val;
  }
  for (let index = 0; index < node.child.length; index++) {
    const prop = node.child[index].tagname;
    const obj = convertToJson(node.child[index], arrayMode);
    if (jObj[prop] !== undefined){
      if (!Array.isArray(jObj[prop])){
        const swap = jObj[prop];
        jObj[prop] = [];
        jObj[prop].push(swap);
      }
      jObj[prop].push(obj);
    } else {
      jObj[prop] = arrayMode ? [obj] : obj;
    }
  }

  return jObj;
};

exports.parse = xml2json;
exports.getTraversalObj = getTraversalObj;
exports.convertToJson = convertToJson;
exports.validate = require('./validator').validate;
