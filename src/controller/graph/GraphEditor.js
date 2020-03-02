import cytoscape from 'cytoscape';
import * as queryinfra from './../infra/InfraQuery';
import * as queryprocess from './../process/ProcessQuery';
import * as querygraph from './GraphQuery';

// final
export function removeModeltypeFromGraph(graph, modeltype) {
  const nodes = graph.nodes();
  const edges = graph.edges();
  const filter_nodes = [];
  const filter_edges = [];
  let edgeDublet = false;

  for (let i = 0; i < nodes.length; i++) { // get all affected nodes
    if (nodes[i].data('modeltype') === modeltype) {
      filter_nodes.push(nodes[i]);
    }
  }

  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < filter_nodes.length; j++) { // based on the affected nodes determine affected edges
      if (edges[i].data('source') === filter_nodes[j].data('id') || edges[i].data('target') === filter_nodes[j].data('id')) {
        for (let k = 0; k < filter_edges.length; k++) {
          if (filter_edges[k] === edges[i]) {
            edgeDublet = true;
            break;
          }
        }
        if (edgeDublet) {
          edgeDublet = false;
        } else {
          filter_edges.push(edges[i]);
        }
      }
    }
  }

  for (let i = 0; i < filter_edges.length; i++) { // first remove edges
    filter_edges[i].remove();
  }

  for (let i = 0; i < filter_nodes.length; i++) { // second remove nodes
    filter_nodes[i].remove();
  }
}

// final
export function createGraphFromGraphelements(graph, graph_elements) {
  const nodes = graph_elements.node;
  const edges = graph_elements.edge;

  removeModeltypeFromGraph(graph, 'process');
  removeModeltypeFromGraph(graph, 'infra');
  removeModeltypeFromGraph(graph, 'compliance');

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    graph.add({
      group: 'nodes',
      data: {
        id: node.id,
        name: node.name,
        props: node.props,
        nodetype: node.nodetype,
        modeltype: node.modeltype,
        display_name: node.display_name,
        nodestyle: node.nodestyle,
      },
    });
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];

    graph.add({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        edgestyle: edge.edgestyle,
      },
    });
  }
}

// final
export function createGraphFromInfra(graph, infra) {
  const nodes = queryinfra.getNodes(infra);
  const sequences = queryinfra.getSequences(infra);

  removeModeltypeFromGraph(graph, 'infra'); // remove old infra model in case of an update

  for (let i = 0; i < nodes.length; i++) {
    graph.add({
      group: 'nodes',
      data: {
        id: nodes[i].id,
        name: nodes[i].name,
        props: nodes[i].props,
        nodetype: 'infra',
        modeltype: 'infra',
        display_name: nodes[i].name,
        nodestyle: '',
      },
    });
  }

  for (let i = 0; i < sequences.length; i++) {
    graph.add({
      group: 'edges',
      data: {
        id: sequences[i].id, source: sequences[i].source, target: sequences[i].target, edgestyle: '',
      },
    });
  }
}

// final
export function createGraphFromProcess(graph, process) {
  const flownodes = queryprocess.getFlowNodesOfProcess(process);
  const sequences = queryprocess.getSequenceFlowsofProcess(process);

  removeModeltypeFromGraph(graph, 'process'); // remove old process model in case of an update

  for (let i = 0; i < flownodes.length; i++) { // add flow elements as nodes to graph
    const flownode = flownodes[i];
    const elementtype = flownode.$type.toLowerCase();

    if (!elementtype.includes('data')) { // only convert flownodes
      const props = queryprocess.getExtensionOfElement(flownode);
      let nodetype = 'businessprocess';

      for (let j = 0; j < props.length; j++) { // check if the node is a compliance process
        if (props[j]._name === 'isComplianceProcess' && props[j]._value === 'true') {
          nodetype = 'complianceprocess';
        }
      }

      graph.add({
        group: 'nodes',
        data: {
          id: flownode.id,
          name: flownode.name,
          props,
          nodetype,
          modeltype: 'process',
          display_name: flownode.name,
          nodestyle: '',
        },
      });
    }
  }

  for (let i = 0; i < sequences.length; i++) { // add edges
    graph.add({
      group: 'edges',
      data: {
        id: sequences[i].id, source: sequences[i].sourceRef.id, target: sequences[i].targetRef.id, edgestyle: '',
      },
    });
  }
}

// final
export function updateFlownodeProperty(graph, businessObject) {
  const node = graph.getElementById(businessObject.id);

  const props = queryprocess.getExtensionOfElement(businessObject); // get extension props of flownode
  let nodetype = 'businessprocess';

  for (let i = 0; i < props.length; i++) { // check if the node is a compliance process
    if (props[i]._name === 'isComplianceProcess' && props[i]._value === 'true') {
      nodetype = 'complianceprocess';
    }
  }

  node.data('name', businessObject.name);
  node.data('nodetype', nodetype);
  node.data('props', props);
}

// final
export function updateITComponentProperty(graph, element) {
  const node = graph.getElementById(element.id);
  const { props } = element;

  node.data('props', props);
}

export function updateITDisplayName_Node(node_graph, node_display) {
  const dir_pred = querygraph.getDirectPredecessor(node_graph);
  let hasCompliancePred = false;

  if (dir_pred.length > 0) {
    for (let i = 0; i < dir_pred.length; i++) {
      if (dir_pred[i].data('modeltype') === 'compliance') {
        hasCompliancePred = true;
        break;
      }
    }
    if (hasCompliancePred) {
      node_display.data('display_name', `${node_display.data('name')}*`);
    } else {
      node_display.data('display_name', node_display.data('name'));
    }
  } else {
    node_display.data('display_name', node_display.data('name'));
  }
}

// final
export function updateITDisplayName(graph_view, graph_infra, element) {
  if (element != null) { // in case of updating a defined IT component
    const node_graph = graph_view.getElementById(element.id);
    const node_display = graph_infra.getElementById(element.id);
    updateITDisplayName_Node(node_graph, node_display);
  } else { // in case of opening a project
    const infra_nodes = graph_infra.nodes();

    for (let i = 0; i < infra_nodes.length; i++) {
      const node_display = infra_nodes[i];
      const node_graph = graph_view.getElementById(node_display.id());

      updateITDisplayName_Node(node_graph, node_display);
    }
  }
}

// todo: sometimes error because leaves[0] is undefined --> Error beim entfernen der Compliance von IT
function removePred(predecessors) {
  const leaves = predecessors.leaves('node');
  const node = leaves[0];
  const dir_succ = querygraph.getDirectSuccessor(node);

  if (dir_succ.length === 0) {
    const dir_pred = querygraph.getDirectPredecessor(node);
    if (dir_pred.length === 0) {
      node.remove();
    } else {
      const pred = node.predecessors().filter('node');

      for (let i = 0; i < dir_pred.length; i++) {
        const edge = querygraph.getEdge(dir_pred[i], node);
        edge.remove();
      }
      node.remove();
      removePred(pred);
    }
  }
}

// final
function removeComplianceNodes(node) { // only necessary for node of type 'compliance'
  const modeltype = node.data('modeltype');
  let successors = [];

  if (modeltype === 'compliance') {
    successors = querygraph.getDirectSuccessor(node);
    const dir_pred = querygraph.getDirectPredecessor(node, 'complianceprocess');

    if (successors.length === 0 && dir_pred.length === 0) {
      const predecessors = node.predecessors().filter('node');
      const dir_predecessor = querygraph.getDirectPredecessor(node);

      for (let i = 0; i < dir_predecessor.length; i++) {
        const edge = querygraph.getEdge(dir_predecessor[i], node);
        edge.remove();
      }
      node.remove(); // initial node

      if (predecessors.length > 0) {
        removePred(predecessors);
      }
    }
  }
}

// final
export function removeNode(node){
  const dirPreds = querygraph.getDirectPredecessor(node);
  const dirSucs = querygraph.getDirectSuccessor(node);

  for (let i = 0; i < dirPreds.length; i++) {
    const edge = querygraph.getEdge(dirPreds[i], node);
    edge.remove();
  }

  for (let i = 0; i < dirSucs.length; i++) {
    const edge = querygraph.getEdge(dirSucs[i], node);
    edge.remove();
  }

  node.remove();
}

// final
export function updateNeighborsBasedOnProps(graph, element) { //
  const node = graph.getElementById(element.id);
  const props = node.data('props');
  const dir_pred = querygraph.getDirectPredecessor(node);
  const dir_suc = querygraph.getDirectSuccessor(node);
  const node_remove = [];
  let node_help;

  if (dir_pred.length > 0) {
    for (let i = 0; i < dir_pred.length; i++) {
      if (dir_pred[i].data('modeltype') !== node.data('modeltype')) {
        node_help = dir_pred[i];
        for (let j = 0; j < props.length; j++) {
          if (props[j]._value === dir_pred[i].id()) {
            node_help = null;
          }
        }
        if (node_help !== null) {
          node_remove.push(node_help);
          node_help = null;
        }
      }
    }
  }

  if (node.data('nodetype') === 'complianceprocess' && dir_suc.length > 0) {
    for (let i = 0; i < dir_suc.length; i++) {
      if (dir_suc[i].data('modeltype') !== node.data('modeltype')) {
        node_help = dir_suc[i];
        for (let j = 0; j < props.length; j++) {
          if (props[j]._value === dir_suc[i].id()) {
            node_help = null;
          }
        }
        if (node_help !== null) {
          node_remove.push(node_help);
          node_help = null;
        }
      }
    }
  }

  for (let i = 0; i < node_remove.length; i++) {
    const edge_remove = querygraph.getEdge(node, node_remove[i]); // 1. determine Edge between
    edge_remove.remove(); // 2. delete edge

    if (node_remove[i].data('modeltype') === 'compliance') {
      removeComplianceNodes(node_remove[i]); // 3. perhaps delete compliance node
    }
  }
}

// final
export function linkNodes(graph, source, target) {
  const edgeID = `${source.id()}_${target.id()}`;
  const exist = graph.getElementById(edgeID);

  if (exist.length === 0) {
    graph.add({
      group: 'edges',
      data: { id: edgeID, source: source.id(), target: target.id() },
    });
  }
}

// final?
export function updateComplianceNode(graph, flowelement) { // change edge direction in case of enable/disable a complianceprocess
  const node = graph.getElementById(flowelement.id);

  if (queryprocess.isCompliance(flowelement)) {
    const dir_pred = querygraph.getDirectPredecessor(node);

    for (let i = 0; i < dir_pred.length; i++) {
      if (dir_pred[i].data('modeltype') === 'compliance') {
        const edge = querygraph.getEdge(dir_pred[i], node);
        edge.remove();
        linkNodes(graph, node, dir_pred[i]);
      }
    }
  } else {
    const dir_suc = querygraph.getDirectSuccessor(node);

    for (let i = 0; i < dir_suc.length; i++) {
      if (dir_suc[i].data('modeltype') === 'compliance') {
        const edge = querygraph.getEdge(node, dir_suc[i]);
        edge.remove();
        linkNodes(graph, dir_suc[i], node);
      }
    }
  }
}

// final
export function addUniqueNode(graph, input, nodestyle) { // adds a single node to the graph if not available
  const { element } = input;
  const { node } = input;
  const nodes = graph.nodes();
  let isUnique = true;

  if (element !== undefined) { // element != null
    for (let i = 0; i < nodes.length; i++) { // determine whether an node with this id already exists
      if (nodes[i].id() === element.id) {
        isUnique = false;
        break;
      }
    }

    if (isUnique) {
      graph.add({
        group: 'nodes',
        data: {
          id: element.id,
          text: element.text,
          title: element.title,
          props: element.source,
          nodetype: 'compliance',
          modeltype: 'compliance',
          display_name: element.title, // alternativ: element.id
          nodestyle,
        },
      });
    }

    return graph.getElementById(element.id);
  }

  if (node !== undefined) { // node != null
    for (let i = 0; i < nodes.length; i++) { // determine whether an node with this id already exists
      if (nodes[i] === node) {
        isUnique = false;
        break;
      }
    }

    if (isUnique) {
      node.data('nodestyle', nodestyle);
      graph.add(node);
    }
    return graph.getElementById(node.id());
  }
  return null;
}

export function addNodes(graph, option) {
  const { requirement } = option;
  const { requirement_2 } = option;
  const { businessObject } = option;
  const { itComponent } = option;
  let source_node;
  let target_node;

  if (requirement !== undefined && requirement_2 !== undefined) { // link requirement-requirement
    source_node = addUniqueNode(graph, { element: requirement });
    target_node = addUniqueNode(graph, { element: requirement_2 });
  }

  if (requirement !== undefined && itComponent !== undefined) { // link requirement-itcomponent
    source_node = addUniqueNode(graph, { element: requirement });
    target_node = graph.getElementById(itComponent.id);
  }

  if (requirement !== undefined && businessObject !== undefined) { // link requirement-flowelement
    if (queryprocess.isCompliance(businessObject)) {
      source_node = graph.getElementById(businessObject.id);
      target_node = addUniqueNode(graph, { element: requirement });
    } else {
      source_node = addUniqueNode(graph, { element: requirement });
      target_node = graph.getElementById(businessObject.id);
    }
  }

  if (itComponent !== undefined && businessObject !== undefined) { // link itcomponent-flowelement
    source_node = graph.getElementById(itComponent.id);
    target_node = graph.getElementById(businessObject.id);
  }

  linkNodes(graph, source_node, target_node);
}

// final??
export function createEdges(source_graph, result_graph, edgestyle) {
  const nodes_source_graph = source_graph.nodes();
  const nodes_result_graph = result_graph.nodes();

  // 1. check if nodes are in result_graph
  for (let i = 0; i < nodes_source_graph.length; i++) {
    const source_node = nodes_source_graph[i];
    const con = nodes_result_graph.contains(source_node);

    if (con) {
      const suc_nodes = querygraph.getDirectSuccessor(source_node);

      // 2. check if direct suc are in result graph
      for (let j = 0; j < suc_nodes.length; j++) {
        const target_node = suc_nodes[j];

        // avoid circles in the analyze graph
        const type_source = source_node.data('nodetype');
        const type_target = target_node.data('nodetype');

        if ((type_source !== 'businessprocess' && type_target !== 'complianceprocess') || (type_source !== 'complianceprocess' && type_target !== 'businessprocess')) {
          const con_2 = nodes_result_graph.contains(target_node);

          // 3. get edge and ad to result_graph
          if (con_2) {
            const edge = querygraph.getEdge(source_node, target_node);
            edge.data('edgestyle', edgestyle);
            result_graph.add(edge);
          }
        }
      }
    }
  }
}

export function removeSingleNodes(graph) {
  const _nodes = graph.nodes();

  for (let i = 0; i < _nodes.length; i++) {
    const node = _nodes[i];

    const incomer = node.incomers();
    const outgoer = node.outgoers();

    if (incomer.length === 0 && outgoer.length === 0) {
      node.remove();
    }
  }
}

export function getEmptyGraph(){
  const graph = cytoscape({
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#ffffff',
          'border-style': 'solid',
          'border-color': '#666',
          'border-width': 1,
          'font-size': 10,
          'text-wrap': 'wrap',
          'text-max-width': 20,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 1,
          'line-color': '#666',
          'mid-target-arrow-color': '#666',
          'mid-target-arrow-shape': 'triangle',
          'line-style': 'dotted',
        },
      },
    ],
    layout: {
      name: 'grid',
      rows: 1,
    },
  });

  return graph;
}

export function addNode(graph, input){
  const { req } = input;
  const { complianceProcess } = input;
  const { comProcessPattern } = input;
  let isUnique;

  if (req !== undefined){
    const { id } = req;
    isUnique = querygraph.isUniqueNode(graph, { id });

    if (isUnique) {
      return graph.add({
        group: 'nodes',
        data: {
          id,
          display_name: id,
          nodetype: 'compliance',
          modeltype: 'compliance',
          props: req.props,
        },
      });
    }
  }

  if (complianceProcess !== undefined){
    const { id } = complianceProcess;
    isUnique = querygraph.isUniqueNode(graph, { id });

    if (isUnique){
      return graph.add({
        group: 'nodes',
        data: {
          id,
          display_name: complianceProcess.name,
          name: complianceProcess.name,
          nodetype: 'complianceprocess',
          modeltype: 'complianceprocess',
          props: complianceProcess.props,
          rule: complianceProcess.rule,
          cpid: complianceProcess.cpid,
        },
      });
    }
  }

  if (comProcessPattern !== undefined){
    const { id } = comProcessPattern;
    isUnique = querygraph.isUniqueNode(graph, { id });

    if (isUnique){
      return graph.add({
        group: 'nodes',
        data: {
          id,
          display_name: comProcessPattern.name,
          name: comProcessPattern.name,
          nodetype: 'complianceprocesspattern',
          modeltype: 'complianceprocesspattern',
          props: comProcessPattern.props,
          rule: comProcessPattern.rule,
        },
      });
    }
  }
  return null;
}

export function linkNodesAltGraph(graph, node, newNode){
  linkNodes(graph, newNode, node);
}
