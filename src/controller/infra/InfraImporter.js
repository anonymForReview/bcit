import fastXmlParser from '../helpers/fast-xml-parser/src/parser';

const elements = [];

function getMetadata(archiObject) {
  const id = archiObject.model.attr['@_identifier'];
  const name = archiObject.model.name['#text'];

  elements.push({ id, name, type: 'metadata' });
}

const propDefintions = {};

function getArchiElements(archiObject) {
  const elems = archiObject.model.elements.element;
  for (let i = -1; ++i < elems.length;) {
    const elem = elems[i];
    const name = elem.name['#text'];
    const id = elem.attr['@_identifier'];

    const props = [];
    if (elem.properties) {
      let elemProps = [];

      if (elem.properties.property.length === undefined){ // in case of one property
        elemProps.push(elem.properties.property);
      } else { // in case of more than one property
        elemProps = elem.properties.property;
      }

      for (let k = -1; ++k < elemProps.length;) {
        const p = elemProps[k];
        const propid = p.attr['@_propertyDefinitionRef'];
        props.push({
          id: propid,
          key: propDefintions[propid],
          value: p.value['#text'],
          name: `${propDefintions[propid]} ${p.value['#text']}`,
        });
      }
    }
    elements.push({
      id, name, props, type: 'node',
    });
  }
}

function getAttributeRelations(obj) {
  if (obj.model.propertyDefinitions !== undefined) {
    const attrRels = obj.model.propertyDefinitions.propertyDefinition;

    for (let i = -1; ++i < attrRels.length;) {
      const attrRel = attrRels[i];
      let propid = '';
      if (attrRel.attr) { propid = attrRel.attr['@_identifier']; }

      propDefintions[propid] = attrRel.name;
    }
  }
}

const sequenceFlows = [];

function getSequenceFlows(obj) {
  const input = obj.model.relationships.relationship;
  let rels = [];

  if (input.length === undefined) { // if only one relationship exists in the model
    rels.push(input);
  } else { // if more than one relationship exists in the model
    rels = input;
  }


  for (let i = -1; ++i < rels.length;) {
    const rel = rels[i];

    const props = [];
    if (rel.properties) {
      for (let k = -1; ++k < rel.properties.property.length;) {
        const p = rel.properties.property[k];
        const propid = p.attr['@_propertyDefinitionRef'];
        props.push({
          id: propid,
          value: p.value['#text'],
          name: propDefintions[propid],
        });
      }
    }

    sequenceFlows.push({
      id: rel.attr['@_identifier'],
      source: rel.attr['@_source'],
      target: rel.attr['@_target'],
      type: 'sequence',
      props,
    });
  }

  Object.assign(elements, sequenceFlows);
}

export default function getInfra(data) {
  try {
    const jsonObj = fastXmlParser.parse(data, {
      attrPrefix: '@_',
      attrNodeName: 'attr',
      textNodeName: '#text',
      ignoreTextNodeAttr: false,
      ignoreNonTextNodeAttr: false,
      textAttrConversion: true,
    });

    elements.splice(0, elements.length);
    sequenceFlows.splice(0, sequenceFlows.length);

    getAttributeRelations(jsonObj);
    getSequenceFlows(jsonObj);
    getArchiElements(jsonObj);
    getMetadata(jsonObj);
    return { infra: elements };
  } catch (e) {
    return { error: e };
  }
}
