// contains functions to check whether alternatives can be executed
import ProjectModel from './../../models/ProjectModel';
import * as GraphQuery from './../graph/GraphQuery';
import * as GraphEditor from './../graph/GraphEditor';
import * as ProcessQuery from './../process/ProcessQuery';

/*

W(Task_A): bis Task_A --> W:Weak Unitl
Task_A -> X(Task_B): Task_B direkt nach Task_A --> X: next

G(Task_A -> F(Task_B)): Task_B kommt irgendwann nach Task_A --> F: eventually

*/

/*
function getTaskId(ltlString) {
  const start = ltlString.indexOf('W(') + 1;
  let result = new String();

  for (let i = start; ltlString.length; i++){
    const char = ltlString.charAt(i);

    if (char !== ')'){
      result += char;
    } else {
      break;
    }
  }
  return result;
}
*/

function isTaskBefore(taskId, sucId, viewer) {
  const shape = ProcessQuery.getShapeOfRegistry(viewer, taskId);
  const sucs = ProcessQuery.getSucessorShapes(viewer, shape);

  for (let i = 0; i < sucs.length; i++) {
    const shapeSuc = sucs[i];
    if (sucId === shapeSuc.id) {
      return true;
    }
  }
  return false;
}

/*
function isTaskAfter(taskId, predId, viewer) {

}
*/

/*
function isTaskBetween(startTaskId, endTaskId, viewer) {

}
*/

export function isExecutable(cpNode, reqNode, deleteGraph, viewer) {
  const trigger = GraphQuery.getPropsValue(cpNode.data('props'), 'trigger')[0]; // there is only one trigger prop
  const reqs = GraphQuery.getPropsValue(cpNode.data('props'), 'req');
  const until = GraphQuery.getPropsValue(reqNode.data('props'), 'until')[0]; // there is only one until prop

  // 1st check whether the requirements to execute are obsolete in the result graph
  const nodes = deleteGraph.nodes();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    for (let j = 0; j < reqs.length; j++) {
      if ((reqs[j] === node.data('id')) && (node.data('nodestyle') !== 'between')) {
        return false;
      }
    }
  }

  // 2nd check all successor of a changed IT component (workaround)
  const changedInfra = GraphQuery.filterNodes(deleteGraph, { style: 'changedElement', type: 'infra' })[0]; // there is only one changed element
  if (changedInfra !== undefined) {
    const infra = ProjectModel.getInfra();
    const infraGraph = GraphEditor.getEmptyGraph();
    GraphEditor.createGraphFromInfra(infraGraph, infra);
    const infraNode = infraGraph.getElementById(changedInfra.data('id'));
    const infraSucs = GraphQuery.getSuccessors(infraNode);

    for (let i = 0; i < infraSucs.length; i++) {
      const sucId = infraSucs[i].data('id');
      for (let j = 0; j < reqs.length; j++) {
        if (sucId === reqs[j]) {
          return false;
        }
      }
    }
  }

  // 3rd check whether trigger is before until
  return isTaskBefore(trigger, until, viewer);
}
