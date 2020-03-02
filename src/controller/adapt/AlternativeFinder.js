import * as AlternativeChecker from './AlternativeChecker';
import * as GraphQuery from './../graph/GraphQuery';

// contains functions to find alternative CP from the AltGraph

function getAlternativeCP(violatedCP, deleteGraph, viewer) {
  const result = [];
  const nodeReq = GraphQuery.filterNodesByType(GraphQuery.getSuccessors(violatedCP), 'compliance')[0];
  const complianceProcesses = GraphQuery.filterNodesByType(GraphQuery.getPredecessors(nodeReq), 'complianceprocess');

  for (let i = 0; i < complianceProcesses.length; i++) {
    const complianceProcess = complianceProcesses[i];

    if (complianceProcess.data('id') !== violatedCP.data('id')) {
      const isExecutable = AlternativeChecker.isExecutable(complianceProcess, nodeReq, deleteGraph, viewer);

      if (isExecutable) {
        result.push({
          violatedCP,
          alternative: complianceProcess,
        });
      }
    }
  }
  return result;
}

function getAlternativePattern(violatedCP) {
  // get first successor node of type pattern
  const cpps = GraphQuery.getDirectSuccessor(violatedCP, 'complianceprocesspattern');
  return cpps[0];
}

function getViolatedComplianceProcess(altGraph, id) {
  // get violated cp node from alternative graph
  const nodes = altGraph.nodes();
  let nodeViolatedCP;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.data('cpid') !== undefined && node.data('cpid') === id) {
      nodeViolatedCP = node;
      break;
    }
  }
  return nodeViolatedCP;
}

export function getAlternatives(altGraph, deleteGraph, viewer) {
  const violatedComplianceProcesses = GraphQuery.filterNodes(deleteGraph, { type: 'complianceprocess' });
  let alternativeCP;

  // find violated cp due to change
  if (violatedComplianceProcesses.length > 0) {
    for (let i = 0; i < violatedComplianceProcesses.length; i++) {
      const violatedComProcess = violatedComplianceProcesses[i];
      const violatedNode = getViolatedComplianceProcess(altGraph, violatedComProcess.id());

      if (violatedNode !== undefined) {
        alternativeCP = getAlternativeCP(violatedNode, deleteGraph, viewer);

        if (alternativeCP.length === 0) {
          const pattern = getAlternativePattern(violatedNode);
          alternativeCP.push({
            violatedCP: violatedNode,
            alternative: pattern,
          });
        }
      } else {
        console.log('can not find compliance process in alternatives');
        return null;
      }
    }
    return alternativeCP;
  }

  // check BPC
  if (violatedComplianceProcesses.length === 0) {
    const requirements = GraphQuery.filterNodes(deleteGraph, { type: 'compliance' });
    let result = [];

    for (let i = 0; i < requirements.length; i++) {
      const nodeReq = requirements[i];
      const id = nodeReq.data('id');

      // 1st get req in alt graph
      const reqAltGraph = altGraph.getElementById(id);

      // 2nd get all compliance processes
      const complianceProcesses = GraphQuery.filterNodesByType(GraphQuery.getPredecessors(reqAltGraph), 'complianceprocess');

      // 3rd check executability of each compliance process
      for (let j = 0; j < complianceProcesses.length; j++) {
        const complianceProcess = complianceProcesses[j];
        const isExecutable = AlternativeChecker.isExecutable(complianceProcess, reqAltGraph, deleteGraph, viewer);

        if (isExecutable) {
          result.push({
            violatedCP: null,
            alternative: complianceProcess,
          });
        }
      }
    }
    return result;
  }
}

/*

export function getAlternatives(altGraph, deleteGraph, viewer) {
  const violatedComplianceProcesses = GraphQuery.filterNodes(deleteGraph, { type: 'complianceprocess' });

  console.log(violatedComplianceProcesses);

  let alternativeCP;

  for (let i = 0; i < violatedComplianceProcesses.length; i++){
    const violatedComProcess = violatedComplianceProcesses[i];
    const violatedNode = getViolatedComplianceProcess(altGraph, violatedComProcess.id());

    if (violatedNode !== undefined) {
      alternativeCP = getAlternativeCP(violatedNode, deleteGraph, viewer);

      if (alternativeCP.length === 0) {
        const pattern = getAlternativePattern(violatedNode);
        alternativeCP.push({
          violatedCP: violatedNode,
          alternative: pattern,
        });
      }
    } else {
      console.log('can not find compliance process in alternatives');
      return null;
    }
  }
  return alternativeCP;
}

 */
