const getAllMatches = function (string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
  	const allmatches = [];
    for (let index = 0; index < match.length; index++) {
  		allmatches.push(match[index]);
  	}
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
};


const doesMatch = function (string, regex){
  const match = regex.exec(string);
  if (match === null || match === undefined) return false;
  return true;
};

const doesNotMatch = function (string, regex){
  return !doesMatch(string, regex);
};

exports.doesMatch = doesMatch;
exports.doesNotMatch = doesNotMatch;
exports.getAllMatches = getAllMatches;
