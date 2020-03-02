import * as querygraph from './GraphQuery';
import * as creategraph from './GraphEditor';

/*
function renderGraph(g) {
  // creategraph.createGraphFromInfra(this.graph, infraclass.infra);
  let layout = g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  layout.run();
  g.autolock(false); //elements can not be moved by the user

  g.reset();//Groesse anpassen

  g.resize();
  g.fit();// alle KNoten werden im Container angzeigt
}
*/

export function resizeGraph(graph) {
  graph.reset();// Groesse anpassen
  // graph.fit();// alle KNoten werden im Container angzeigt
  graph.resize(); // Komplette Container nutzen
}

function removeIT(graph) {
  const nodes = graph.nodes();
  let removed;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.data('nodetype') === 'infra') {
      const dir_pred = querygraph.getDirectPredecessor(node);
      const dir_suc = querygraph.getDirectSuccessor(node);
      if (dir_pred.length === 0 && node.data('nodestyle') !== 'changedElement') {
        node.remove();
        removed = true;
      } else if (node.data('nodestyle') === 'between' && dir_suc.length === 0){
        node.remove();
        removed = true;
      }
    }
  }

  if (removed) {
    removeIT(graph);
  }
}

export function clearGraph(graph) {
  creategraph.removeSingleNodes(graph);
  removeIT(graph);
}

export function removeActivity(graph) {
  const _nodes = graph.nodes();

  for (let i = 0; i < _nodes.length; i++) {
    const node = _nodes[i];
    const nodetype = node.data('nodetype');
    const nodestyle = node.data('nodestyle');

    if (nodetype === 'businessprocess' && nodestyle === 'between') {
      node.remove();
    }
  }
}

function drawCompliancePreds(node, compliance_preds) {
  const xNode = node.position('x');
  const yNode = node.position('y');

  for (let j = 0; j < compliance_preds.length; j++) {
    const compliance = compliance_preds[j];
    const xCompliance = xNode + (j + 1) * 100;
    const yCompliance = yNode;
    compliance.position({ x: xCompliance, y: yCompliance });
  }
}

function updateInfraCP(node, container) {
  const changed_node = node;
  const x = container.offsetWidth / 2;
  const y = container.offsetHeight / 2;
  changed_node.position({ x, y });
  const x_changed = changed_node.position('x');
  const y_changed = changed_node.position('y');

  // consider compliance of changed_node
  if (changed_node.data('nodetype') !== 'complianceprocess') {
    const compliance_preds = querygraph.getPredecessors(changed_node, 'compliance');
    drawCompliancePreds(changed_node, compliance_preds);
  }

  if (changed_node.data('nodetype') === 'complianceprocess') {
    const dir_comp_sucs = querygraph.getDirectSuccessor(changed_node, 'compliance');

    for (let i = 0; i < dir_comp_sucs.length; i++) {
      const compliance = dir_comp_sucs[i];
      const x_compliance = x_changed + (i + 1) * 100;
      const y_compliance = y_changed;
      compliance.position({ x: x_compliance, y: y_compliance });

      const com_preds = querygraph.getPredecessors(compliance, 'compliance');
      drawCompliancePreds(compliance, com_preds);
    }
  }

  // consider infra_preds and its compliance requirements
  const preds = querygraph.getPredecessors(changed_node, '!compliance');

  for (let i = 0; i < preds.length; i++) {
    const predNode = preds[i];
    const x_node = x_changed;
    const y_node = y_changed + (i + 1) * 80;
    predNode.position({ x: x_node, y: y_node });

    const compliance_preds = querygraph.getPredecessors(predNode, 'compliance');

    drawCompliancePreds(predNode, compliance_preds);
  }

  // consider sucs
  const sucs = querygraph.getSuccessors(changed_node, '!compliance');

  for (let i = 0; i < sucs.length; i++) {
    const nodeSuc = sucs[i];
    const x_node = x_changed;
    const y_node = y_changed - (i + 1) * 80;
    nodeSuc.position({ x: x_node, y: y_node });

    if (nodeSuc.data('nodetype') !== 'complianceprocess') {
      const compliance_preds = querygraph.getPredecessors(nodeSuc, 'compliance');
      drawCompliancePreds(nodeSuc, compliance_preds);
    }

    if (nodeSuc.data('nodetype') === 'complianceprocess') {
      // consider compliance of compliance process
      const dir_comp_sucs = querygraph.getDirectSuccessor(nodeSuc, 'compliance');
      let x_compliance;
      let y_compliance;

      for (let j = 0; j < dir_comp_sucs.length; j++) {
        const compliance = dir_comp_sucs[j];
        x_compliance = x_node + (j + 1) * 100;
        y_compliance = y_node;
        compliance.position({ x: x_compliance, y: y_compliance });

        const com_preds = querygraph.getPredecessors(compliance, 'compliance');
        drawCompliancePreds(compliance, com_preds);
      }
    }
  }
}

function updateBusinessProcess(node, container) {
  const changedNode = node;
  const x = container.offsetWidth / 2;
  const y = container.offsetHeight / 2;
  changedNode.position({ x, y });

  const xChanged = changedNode.position('x');
  const yChanged = changedNode.position('y');

  const dirCompPreds = querygraph.getDirectPredecessor(changedNode, 'compliance');
  for (let i = 0; i < dirCompPreds.length; i++) {
    const compliance = dirCompPreds[i];

    const xCompliance = xChanged + (i + 1) * 100;
    const yCompliance = yChanged + (i + 1) * 100;
    compliance.position({ x: xCompliance, y: yCompliance });

    // draw compliance preds horizontal
    let compPreds = querygraph.getPredecessors(compliance, 'compliance');
    drawCompliancePreds(compliance, compPreds);


    // draw other preds vertical
    const preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      const pred = preds[j];
      if (pred !== changedNode) { // avoid that predecessor is the changed element
        const xPred = xCompliance;
        const yPred = yCompliance - (j + 1) * 100;

        pred.position({ x: xPred, y: yPred });

        compPreds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, compPreds);
      }
    }
  }

  // draw IT preds vertical
  const itPreds = querygraph.getPredecessors(changedNode, 'infra');
  for (let i = 0; i < itPreds.length; i++) {
    const infra = itPreds[i];

    const xInfra = xChanged;
    const yInfra = yChanged - (i + 1) * 100;
    infra.position({ x: xInfra, y: yInfra });
    // draw compliance preds horizontal
    const compPreds = querygraph.getPredecessors(infra, 'compliance');
    drawCompliancePreds(infra, compPreds);
  }
}

function updateCompliance(node, container) {
  const changedNode = node;
  const x = container.offsetWidth / 2;
  const y = container.offsetHeight / 2;
  changedNode.position({ x, y });
  const xChanged = changedNode.position('x');
  const yChanged = changedNode.position('y');

  // consider compliance preds
  const compliancePreds = querygraph.getPredecessors(changedNode, 'compliance');
  for (let i = 0; i < compliancePreds.length; i++) {
    const compliance = compliancePreds[i];
    const xCompliance = xChanged - (i + 1) * 100;
    const yCompliance = yChanged - (i + 1) * 100;
    compliance.position({ x: xCompliance, y: yCompliance });

    // draw other preds vertical
    const preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      const pred = preds[j];
      if (pred !== changedNode) { // avoid that predecessor is the changed element
        const xPred = xCompliance;
        const yPred = yCompliance - (j + 1) * 100;

        pred.position({ x: xPred, y: yPred });

        const compPreds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, compPreds);
      }
    }
  }

  // consider compliance sucs
  const complianceSucs = querygraph.getSuccessors(changedNode, 'compliance');
  for (let i = 0; i < complianceSucs.length; i++) {
    const compliance = complianceSucs[i];
    const xCompliance = xChanged + (i + 1) * 100;
    const yCompliance = yChanged + (i + 1) * 100;
    compliance.position({ x: xCompliance, y: yCompliance });

    // draw other preds vertical
    const preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      const pred = preds[j];
      if (pred !== changedNode) { // avoid that predecessor is the changed element
        const xPred = xCompliance;
        const yPred = yCompliance - (j + 1) * 100;

        pred.position({ x: xPred, y: yPred });

        const compPreds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, compPreds);
      }
    }
  }


  // consider preds != compliance
  const preds = querygraph.getPredecessors(changedNode, '!compliance');

  for (let j = 0; j < preds.length; j++) {
    const pred = preds[j];
    if (pred !== changedNode) { // avoid that predecessor is the changed element
      const xPred = xChanged;
      const yPred = yChanged - (j + 1) * 100;

      pred.position({ x: xPred, y: yPred });

      const compPreds = querygraph.getPredecessors(pred, 'compliance');
      drawCompliancePreds(pred, compPreds);
    }
  }
}

export function drawAnalyze(graph, container) {
  const changed_node = graph.nodes().filter('node[nodestyle = "changedElement"]')[0]; // only one change node possible
  const nodetype = changed_node.data('nodetype');

  if (nodetype === 'infra' || nodetype === 'complianceprocess') {
    updateInfraCP(changed_node, container);
  }

  if (nodetype === 'compliance') {
    updateCompliance(changed_node, container);
  }

  if (nodetype === 'businessprocess') {
    updateBusinessProcess(changed_node, container);
  }
  clearGraph(graph);
}

export function styleNodes(graph) {
  const nodes = graph.nodes();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeType = node.data('nodetype');

    // set label
    if (nodeType === 'compliance') {
      node.style('label', node.data('title'));
    } else {
      if (node.data('name') !== undefined) {
        node.style('label', node.data('name'));
      } else {
        node.style('label', node.data('id'));
      }
    }

    // set border width
    node.style('border-width', 2);

    // set border color
    if (nodeType === 'businessprocess') {
      node.style('border-color', 'green');
    } else if (nodeType === 'complianceprocess') {
      node.style('border-color', 'grey');
    } else if (nodeType === 'compliance') {
      node.style('border-color', 'red');
    } else if (nodeType === 'infra') {
      node.style('border-color', 'orange');
    }
  }
}

export function copyGraphElements(graphView, graphData) {
  const nodes = graphData.nodes();
  const edges = graphData.edges();

  for (let i = 0; i < nodes.length; i++) {
    graphView.add(nodes[i]);
  }

  for (let i = 0; i < edges.length; i++) {
    graphView.add(edges[i]);
  }
}

export function removeElements(graph) {
  const nodes = graph.nodes();
  const edges = graph.edges();

  for (let i = 0; i < edges.length; i++) { // first remove edges
    edges[i].remove();
  }

  for (let i = 0; i < nodes.length; i++) { // second remove nodes
    nodes[i].remove();
  }
}

export function styleNodesAnalyzeGraph(graph) {
  const nodes = graph.nodes();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodestyle = node.data('nodestyle');
    const nodetype = node.data('nodetype');

    node.style('border-width', 2);
    node.style('font-size', 12);

    if (nodestyle === 'directdemand') {
      node.style('border-color', 'green');
    } else if (nodestyle === 'indirectdemand') {
      node.style('border-color', 'green');
    } else if (nodestyle === 'obsolete') {
      node.style('border-color', 'blue');
    } else if (nodestyle === 'violated') {
      node.style('border-color', 'red');
    } else if (nodestyle === 'changedElement') {
      node.style('border-color', 'orange');
    } else if (nodestyle === 'between') {
      node.style('border-color', 'grey');
    }

    if (nodetype === 'infra') {
      node.style('shape', 'triangle');
    } else if (nodetype === 'businessprocess') {
      node.style('shape', 'roundrectangle');
    } else if (nodetype === 'compliance') {
      node.style('shape', 'rectangle');
    } else if (nodetype === 'complianceprocess') {
      node.style('shape', 'roundrectangle');
      node.style('background-color', 'grey');
    }
  }
}

export function styleEdgesAnalyzeGraph(graph) {
  const edges = graph.edges();

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (edge.data('edgestyle') === 'direct') {
      edge.style('line-style', 'solid');
    }
  }
}

export function renderAnalyzeGraph(graph, graphAnalyze, container){
  removeElements(graph);
  copyGraphElements(graph, graphAnalyze);
  styleEdgesAnalyzeGraph(graph);
  styleNodesAnalyzeGraph(graph);
  drawAnalyze(graph, container);
  // resizeGraph(graph);
}

export function styleNodesAltGraph(graph) {
  const nodes = graph.nodes();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodetype = node.data('nodetype');

    node.style('label', node.data('display_name'));

    if (nodetype === 'businessprocess') {
      node.style('shape', 'roundrectangle');
    } else if (nodetype === 'compliance') {
      node.style('shape', 'rectangle');
    } else if (nodetype === 'complianceprocess') {
      node.style('shape', 'roundrectangle');
      node.style('background-color', 'grey');
    } else if (nodetype === 'complianceprocesspattern') {
      node.style('shape', 'roundrectangle');
    }
  }
}

function getPosX(noPreds, posX, j){
  let result;

  if (noPreds === 1){
    result = posX;
  } else if ((noPreds % 2) === 0){
    result = posX - (noPreds / 2) * 60 + (j * 120);
  } else {
    result = posX - ((noPreds - 1) / 2) * 60 + (j * 120);
  }

  return result;
}

function drawNodes(nodes){
  const nextIteration = [];

  for (let i = 0; i < nodes.length; i++){
    const node = nodes[i];
    const dirPreds = querygraph.getDirectPredecessor(node);
    const posX = node.position('x');
    const posY = node.position('y');
    for (let j = 0; j < dirPreds.length; j++){
      const nodePred = dirPreds[j];
      const predX = getPosX(dirPreds.length, posX, j);
      const predY = posY + 150;
      nodePred.position({ x: predX, y: predY });
      if (querygraph.getDirectPredecessor(nodePred).length > 0){
        nextIteration.push(nodePred);
      }
    }
  }

  if (nextIteration.length > 0){
    drawNodes(nextIteration);
  }
}

export function drawNodesAltGraph(graph){
  const compliance = querygraph.filterNodes(graph, { type: 'compliance' });

  for (let i = 0; i < compliance.length; i++){
    const node = compliance[i];
    const posX = 270 + (i * 120);
    const posY = 150;
    node.position({ x: posX, y: posY });

    const dirPreds = querygraph.getDirectPredecessor(node);
    for (let j = 0; j < dirPreds.length; j++){
      const nodePred = dirPreds[j];
      const predX = getPosX(dirPreds.length, posX, j);
      const predY = posY + 150;
      nodePred.position({ x: predX, y: predY });
    }
    drawNodes(dirPreds);
  }
}

export function highlightNode(node) {
  node.style('color', '#017ADC');
  node.style('font-weight', 'bold');
}

export function unhighlightNodes(graph) {
  const nodes = graph.nodes();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    node.style('color', 'black');
    node.style('font-weight', 'normal');
  }
}
