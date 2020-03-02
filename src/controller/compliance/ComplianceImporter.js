const convert = require('xml-js');

class Requirement {
  constructor() {
    this.id = undefined;
    this.text = undefined;
    this.title = undefined;
    this.source = undefined;
  }
}

class Source {
  constructor() {
    this.id = undefined;
    this.norm = undefined;
    this.paragraph = undefined;
    this.section = undefined;
  }
}

function getComplianceFromJson(json) {
  const compliance = {
    requirement: [],
  };

  const result = Object.assign({}, compliance);


  for (let i = 0; i < json.requirement.length; i++) {
    const reqJson = json.requirement[i];
    const csJson = json.requirement[i].source;
    const req = new Requirement();
    const cs = new Source();

    // cs.id = 'source_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
    cs.id = `src_${cs.norm}_${cs.paragraph}_${cs.section}`;
    cs.norm = csJson.norm;
    cs.paragraph = csJson.paragraph;
    cs.section = csJson.section;

    // req.id = 'requirement_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
    req.id = `req_${cs.norm}_${cs.paragraph}_${cs.section}`;
    req.text = reqJson.text;
    req.title = reqJson.title;
    req.source = cs;

    result.requirement.push(req);
  }

  return result;
}

function getPlainText(input) {
  let j;
  const pattern = new RegExp('[A-Ü]');
  const s = input.toString();

  for (let i = 0; i < s.length; i++) {
    const character = s.charAt(i);
    if (pattern.test(character)) {
      j = i;
      break;
    }
  }
  return s.substring(j, s.length);
}

function getPlainParagraph(input) {
  return input.substring(2, input.length);
}

function getComplianceFromXml(helpObj) {
  const compliance = {
    requirement: [],
  };

  const result = Object.assign({}, compliance);

  for (let i = 0; i < helpObj.dokumente.norm.length; i++) {
    if (helpObj.dokumente.norm[i].metadaten.enbez !== undefined) {
      if (helpObj.dokumente.norm[i].textdaten.text !== undefined) {
        if (helpObj.dokumente.norm[i].textdaten.text.Content !== undefined) {
          if (helpObj.dokumente.norm[i].textdaten.text.Content.P !== undefined) { // falls ein Paragraph gelöscht wurde
            if (helpObj.dokumente.norm[i].textdaten.text.Content.P.length !== undefined) {
              for (let j = 0; j < helpObj.dokumente.norm[i].textdaten.text.Content.P.length; j++) {
                const s = helpObj.dokumente.norm[i].textdaten.text.Content.P[j]._text;
                if (s !== undefined) {
                  const r = new Requirement();
                  if (helpObj.dokumente.norm[i].metadaten.titel !== undefined) {
                    r.title = helpObj.dokumente.norm[i].metadaten.titel._text;
                  }
                  r.text = getPlainText(s);
                  const cs = new Source();
                  const norm = helpObj.dokumente.norm[i].metadaten.jurabk;

                  if (norm.length === undefined) {
                    cs.norm = norm._text;
                  } else {
                    cs.norm = norm[0]._text;
                  }

                  cs.paragraph = `§ ${getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text)}`;
                  cs.section = Number(j) + 1;
                  // cs.id = 'source_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
                  cs.id = `src_${cs.norm}_${cs.paragraph}_${cs.section}`;
                  r.source = cs;
                  // r.id = 'requirement_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
                  r.id = `req_${cs.norm}_${cs.paragraph}_${cs.section}`;
                  result.requirement.push(r);
                }
              }
            } else {
              const s = helpObj.dokumente.norm[i].textdaten.text.Content.P._text; // wenn keine Absätze vorhanden sind, Paragraphen ausgeben
              if (s !== undefined) {
                const r = new Requirement();
                if (helpObj.dokumente.norm[i].metadaten.titel !== undefined) {
                  r.title = helpObj.dokumente.norm[i].metadaten.titel._text;
                }
                r.text = getPlainText(s);
                const cs = new Source();
                cs.norm = helpObj.dokumente.norm[i].metadaten.jurabk._text;
                cs.paragraph = `§ ${getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text)}`;
                r.source = cs;
                // cs.id = 'source_' + cs.norm + '_' + cs.paragraph;
                // r.id = 'requirement_' + cs.norm + '_' + cs.paragraph;
                cs.id = `src_${cs.norm}_${cs.paragraph}`;
                r.id = `req_${cs.norm}_${cs.paragraph}`;
                result.requirement.push(r);
              }
            }
          }
        }
      }
    }
  }
  return result;
}

export function getJSON(input) {
  if (input.includes('requirement')) {
    const json = JSON.parse(input);
    return getComplianceFromJson(json);
  }
  const helpObj = JSON.parse(convert.xml2json(input, { compact: true, spaces: 2 }));

  return getComplianceFromXml(helpObj);
}

export function addCompliance(input) {
  // compliance: existing compliance json
  // imported_compliance: compliance to be added to compliance

  const { compliance } = input;
  const importedCompliance = input.imported_compliance;

  if (compliance === null) {
    return importedCompliance;
  }
  const updatedCompliance = compliance;

  for (let i = 0; i < importedCompliance.requirement.length; i++) {
    const reqImport = importedCompliance.requirement[i];
    let isNew = true;

    for (let j = 0; j < compliance.requirement.length; j++) {
      const req = compliance.requirement[j];

      if (reqImport.id === req.id) {
        isNew = false;
      }
    }

    if (isNew) {
      updatedCompliance.requirement.push(reqImport);
    }
  }

  return updatedCompliance;
}
