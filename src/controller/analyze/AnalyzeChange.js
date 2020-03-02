import cytoscape from 'cytoscape';
import * as creategraph from './../graph/GraphEditor';
import * as analyzehelper from './AnalyzeHelper';
import * as rendergraph from './../graph/GraphRenderer';
import * as ProcessQuery from '../process/ProcessQuery';

// final?
export function getGraphReplaceITComponent(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');

  analyzehelper.replaceITDirect(graph, node, result_graph);
  analyzehelper.replaceITTransitive(graph, node, result_graph);

  return result_graph;
}

// final?
export function getGraphDeleteITComponent(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');

  analyzehelper.deleteITObsolete(graph, _node, result_graph);
  analyzehelper.deleteITViolation(graph, _node, result_graph);

  return result_graph;
}

export function getGraphReplaceRequirement(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');
  analyzehelper.replaceComplianceTransitive(graph, _node, result_graph);
  analyzehelper.replaceComplianceDirect(graph, _node, result_graph);

  return result_graph;
}

export function getGraphDeleteRequirement(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');
  analyzehelper.deleteComplianceObsolete(graph, _node, result_graph);
  return result_graph;
}

export function getGraphReplaceBusinessActivity(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');
  analyzehelper.replaceActivityDirect(graph, _node, result_graph);
  analyzehelper.replaceProcessTransitive(graph, _node, result_graph);

  rendergraph.removeActivity(result_graph); // workaround

  return result_graph;
}

export function getGraphDeleteBusinessActivity(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');
  analyzehelper.deleteActivityObsolte(graph, _node, result_graph);

  return result_graph;
}

// final?
export function getGraphReplaceComplianceProcess(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');

  analyzehelper.replaceComplianceProcessDirect(graph, _node, result_graph);
  analyzehelper.replaceProcessTransitive(graph, _node, result_graph);

  rendergraph.removeActivity(result_graph); // workaround

  return result_graph;
}

// final?
export function getGraphDeleteComplianceProcess(graph, node) {
  const result_graph = cytoscape({/* options */});
  const _node = node;

  creategraph.addUniqueNode(result_graph, { node: _node }, 'changedElement');

  analyzehelper.deleteComplianceProcessObsolete(graph, _node, result_graph);
  analyzehelper.deleteComplianceProcessViolation(graph, _node, result_graph);

  return result_graph;
}

export function getChangeGraph(input, graph){
  const { shape } = input;
  const { itComponent } = input;
  const { req } = input;
  let changeGraph = null;

  if (shape !== undefined){
    const { businessObject } = shape;
    let node = graph.getElementById(businessObject.id);
    const isCP = ProcessQuery.isCompliance(businessObject);
    const isTaskOrSubprocess = ProcessQuery.isTaskOrSubprocess(shape);
    const isInfra = ProcessQuery.isDataStore(businessObject) && ProcessQuery.isExtensionShape(shape); //
    const isReq = ProcessQuery.isDataObject(businessObject) && ProcessQuery.isExtensionShape(shape); //

    if (isCP) {
      changeGraph = getGraphReplaceComplianceProcess(graph, node);
    } else if (isTaskOrSubprocess) {
      changeGraph = getGraphReplaceBusinessActivity(graph, node);
    } else if (isInfra) {
      const id = ProcessQuery.getIdFromExtensionShape(shape);
      node = graph.getElementById(id);
      changeGraph = getGraphReplaceITComponent(graph, node);
    } else if (isReq) {
      const id = ProcessQuery.getIdFromExtensionShape(shape);
      node = graph.getElementById(id);
      changeGraph = getGraphReplaceRequirement(graph, node);
    } else {
      return false;
    }
  }

  if (itComponent !== undefined){
    const { id } = itComponent;
    const node = graph.getElementById(id);
    changeGraph = getGraphReplaceITComponent(graph, node);
  }

  if (req !== undefined){
    const { id } = req;
    const node = graph.getElementById(id);
    changeGraph = getGraphReplaceRequirement(graph, node);
  }

  return changeGraph;
}

export function getDeleteGraph(input, graph){
  const { shape } = input;
  const { itComponent } = input;
  const { req } = input;
  let deleteGraph = null;

  if (shape !== undefined){
    const { businessObject } = shape;
    let node = graph.getElementById(businessObject.id);
    const isCP = ProcessQuery.isCompliance(businessObject);
    const isTaskOrSubprocess = ProcessQuery.isTaskOrSubprocess(shape);
    const isInfra = ProcessQuery.isDataStore(businessObject) && ProcessQuery.isExtensionShape(shape); //
    const isReq = ProcessQuery.isDataObject(businessObject) && ProcessQuery.isExtensionShape(shape); //

    if (isCP) {
      deleteGraph = getGraphDeleteComplianceProcess(graph, node);
    } else if (isTaskOrSubprocess) {
      deleteGraph = getGraphDeleteBusinessActivity(graph, node);
    } else if (isInfra) {
      const id = ProcessQuery.getIdFromExtensionShape(shape);
      node = graph.getElementById(id);
      deleteGraph = getGraphDeleteITComponent(graph, node);
    } else if (isReq) {
      const id = ProcessQuery.getIdFromExtensionShape(shape);
      node = graph.getElementById(id);
      deleteGraph = getGraphDeleteRequirement(graph, node);
    }
  }

  if (itComponent !== undefined){
    const { id } = itComponent;
    const node = graph.getElementById(id);
    deleteGraph = getGraphDeleteITComponent(graph, node);
  }

  if (req !== undefined){
    const { id } = req;
    const node = graph.getElementById(id);
    deleteGraph = getGraphDeleteRequirement(graph, node);
  }

  return deleteGraph;
}
