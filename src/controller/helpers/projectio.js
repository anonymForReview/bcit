import { saveAs } from 'file-saver';
import ProjectModel from './../../models/ProjectModel';
import * as GraphEditor from './../graph/GraphEditor';
import * as FileIo from './fileio';

export function getElementsFromGraph(graph) {
  if (graph === null){
    return null;
  }
  const nodes = graph.nodes();
  const edges = graph.edges();

  const graphElements = {
    node: [],
    edge: [],
  };

  for (let i = 0; i < nodes.length; i++) {
    const _node = nodes[i];
    graphElements.node.push(_node.data());
  }

  for (let i = 0; i < edges.length; i++) {
    const _edge = edges[i];
    graphElements.edge.push(_edge.data());
  }
  return graphElements;
}

export function getGraphFromElements(elements) {
  if (elements === null) {
    return null;
  }
  const graph = GraphEditor.getEmptyGraph();
  const nodes = elements.node;
  const edges = elements.edge;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    graph.add({
      group: 'nodes',
      data: node,
    });
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];

    graph.add({
      group: 'edges',
      data: edge,
    });
  }
  return graph;
}

export function newProject() {
  ProjectModel.setAltGraph(null);
  ProjectModel.setRemoveGraph(null);
  ProjectModel.setChangeGraph(null);
  ProjectModel.setGraph(null);
  ProjectModel.setInfra(null);
  ProjectModel.setBpmnXml(null);
  ProjectModel.setCompliance(null);
  ProjectModel.setViewer(null);
  ProjectModel.setName(null);
}

export async function openProject(content){
  let fileContent;

  try {
    if (content !== undefined){
      fileContent = content;
    } else {
      const file = await FileIo.getFile('.bcit');
      fileContent = await FileIo.readFile(file);
    }

    const projectFile = JSON.parse(fileContent);
    const graph = getGraphFromElements(projectFile.graph);
    const altGraph = getGraphFromElements(projectFile.altGraph);

    ProjectModel.setBpmnXml(projectFile.bpmn);
    ProjectModel.setInfra(projectFile.infra);
    ProjectModel.setCompliance(projectFile.compliance);
    ProjectModel.setGraph(graph);
    ProjectModel.setAltGraph(altGraph);

    return true;
  } catch (e) {
    return false;
  }
}

export async function exportProject(){
  const projectFile = {
    bpmn: ProjectModel.getBpmnXml(),
    infra: ProjectModel.getInfra(),
    compliance: ProjectModel.getCompliance(),
    graph: getElementsFromGraph(ProjectModel.getGraph()),
    altGraph: getElementsFromGraph(ProjectModel.getAltGraph()),
  };

  const output = JSON.stringify(projectFile);
  const file = new File([output], 'BCIT project.bcit', { type: 'text/plain;charset=utf-8' });
  saveAs(file);
}

export function exportBpmn(bpmnXml, name){
  const output = bpmnXml || ProjectModel.getBpmnXml();

  if (output !== null) {
    const fileName = `${name}.bpmn` || 'process.bpmn';
    const file = new File([output], fileName, {type: 'text/plain;charset=utf-8'});
    saveAs(file);
    return true;
  } else {
    return false;
  }
}
