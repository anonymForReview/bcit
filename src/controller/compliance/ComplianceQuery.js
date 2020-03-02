export function getRequirementContainsTitle(requirements, input) {
  const result = [];

  for (let i = 0; i < requirements.length; i++) {
    if (requirements[i].title !== undefined) {
      const title = requirements[i].title.toLowerCase();
      const lowInput = input.toLowerCase();
      if (title.includes(lowInput)) {
        result.push(requirements[i]);
      }
    }
  }
  return result;
}

export function getRequirementContainsText(requirements, input) {
  const result = [];

  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i].text.toLowerCase();
    const lowInput = input.toLowerCase();
    if (req.includes(lowInput)) {
      result.push(requirements[i]);
    }
  }
  return result;
}

export function getRequirementBySource(requirements, paragraph, section) {
  const result = [];

  if (section === undefined) {
    for (let i = 0; i < requirements.length; i++) {
      if (requirements[i].source.paragraph === paragraph) {
        result.push(requirements[i]);
      }
    }
  } else if (paragraph === undefined) {
    for (let i = 0; i < requirements.length; i++) {
      if (requirements[i].source.section !== undefined && requirements[i].source.section === section) {
        result.push(requirements[i]);
      }
    }
  } else {
    for (let i = 0; i < requirements.length; i++) {
      if (requirements[i].source.paragraph === paragraph && requirements[i].source.section !== undefined && requirements[i].source.section === section) {
        result.push(requirements[i]);
      }
    }
  }
  return result;
}

export function getRequirementById(requirements, id) {
  for (let i = 0; i < requirements.length; i++) {
    if (requirements[i].id === id) {
      return requirements[i];
    }
  }
  return null;
}

export function toString(requirements, id) {
  const requirement = getRequirementById(requirements, id);
  return `ID: ${requirement.id}\n Source: ${requirement.source.norm}, ${requirement.source.paragraph}, Section ${requirement.source.section}\nTitle: ${requirement.title}\n${requirement.text}`;
}
