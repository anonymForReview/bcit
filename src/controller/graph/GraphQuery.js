export function getDirectPredecessor(node, nodetype) {
  let helper = [];
  helper = node.incomers();
  const predecessors = [];
  let exclude;
  let _nodetype;

  if (nodetype !== undefined && nodetype.includes('!')) { // todo: Aenderung von null auf undefined testen -> scheint zu funktionieren
    exclude = true;
    _nodetype = nodetype.replace('!', ''); // remove ! for checking the nodetypes
  } else {
    exclude = false;
    _nodetype = nodetype;
  }

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      if (nodetype === undefined) {
        predecessors.push(helper[i]);
      }

      if (nodetype !== undefined && exclude === false) {
        if (helper[i].data('nodetype') === _nodetype) {
          predecessors.push(helper[i]);
        }
      } else if (nodetype !== undefined && exclude === true) {
        if (helper[i].data('nodetype') !== _nodetype) {
          predecessors.push(helper[i]);
        }
      }
    }
  }
  return predecessors;
}

export function getDirectSuccessor(node, nodetype) {
  const successor = [];
  const helper = node.outgoers();
  let _nodetype;
  let exclude;

  if (nodetype !== undefined && nodetype.includes('!')) {
    exclude = true;
    _nodetype = nodetype.replace('!', ''); // remove ! for checking the nodetypes
  } else {
    exclude = false;
    _nodetype = nodetype;
  }

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      if (nodetype === undefined) {
        successor.push(helper[i]);
      }

      if (nodetype !== undefined && exclude === false) {
        if (helper[i].data('nodetype') === _nodetype) {
          successor.push(helper[i]);
        }
      } else if (nodetype !== undefined && exclude === true) {
        if (helper[i].data('nodetype') !== _nodetype) {
          successor.push(helper[i]);
        }
      }
    }
  }
  return successor;
} // todo: Aenderung von null auf undefined testen

export function filterNodesByType(nodes, type) {
  const result = [];

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data('nodetype') === type) {
      result.push(nodes[i]);
    }
  }
  return result;
}

export function getEdge(source, target) {
  const sourceEdge = source.connectedEdges();
  const targetEdge = target.connectedEdges();
  let result;

  for (let i = 0; i < sourceEdge.length; i++) {
    for (let j = 0; j < targetEdge.length; j++) {
      if (sourceEdge[i] === targetEdge[j]) {
        result = sourceEdge[i];
        break;
      }
    }
  }

  return result;
}

function uniqueArray(input) {
  const result = [];

  for (let i = 0; i < input.length; i++) {
    const el = input[i];
    let unique = true;

    for (let j = 0; j < result.length; j++) {
      const check = result[j];
      if (el === check) {
        unique = false;
        break;
      }
    }

    if (unique) {
      result.push(el);
    } else {
      unique = true;
    }
  }

  return result;
}

function getPredsOfType(to_check, nodetype, preds) {
  const toCheck = to_check;
  const newCheck = [];

  for (let i = 0; i < toCheck.length; i++) {
    const dir_pred = getDirectPredecessor(toCheck[i], nodetype);

    for (let j = 0; j < dir_pred.length; j++) {
      preds.push(dir_pred[j]);
      newCheck.push(dir_pred[j]);
    }
  }

  if (newCheck.length > 0) {
    return getPredsOfType(newCheck, nodetype, preds);
  }
  return uniqueArray(preds);
}

function getSucsOfType(to_check, nodetype, sucs) {
  const toCheck = to_check;
  const newCheck = [];

  for (let i = 0; i < toCheck.length; i++) {
    const dirSuc = getDirectSuccessor(toCheck[i], nodetype);

    for (let j = 0; j < dirSuc.length; j++) {
      sucs.push(dirSuc[j]);
      newCheck.push(dirSuc[j]);
    }
  }

  if (newCheck.length > 0) {
    return getSucsOfType(newCheck, nodetype, sucs);
  }
  return uniqueArray(sucs);
}

export function getPredecessors(node, nodetype) {
  const dirPreds = getDirectPredecessor(node, nodetype);

  return getPredsOfType(dirPreds, nodetype, dirPreds);
}

export function getSuccessors(node, nodetype) {
  const dirSucs = getDirectSuccessor(node, nodetype);

  return getSucsOfType(dirSucs, nodetype, dirSucs);
}

export function getNodesBetween(source, target) {
  const succ = source.successors().filter('node');
  const pred = target.predecessors().filter('node');
  const nodes = [];

  for (let i = 0; i < succ.length; i++) {
    const node_suc = succ[i];
    for (let j = 0; j < pred.length; j++) {
      const node_pred = pred[j];
      if (node_suc === node_pred) {
        // avoid dublett
        let isUnique = true;
        for (let k = 0; k < nodes.length; k++) {
          if (node_suc === nodes[k]) {
            isUnique = false;
            break;
          }
        }

        if (isUnique) {
          nodes.push(node_suc);
        }
      }
    }
  }

  return nodes;
}

export function getLeavesOfType(node, modeltype) {
  const leaves = [];
  // let suc = node.successors().filter('node');
  let type;

  if (modeltype != null) {
    type = modeltype;
  } else {
    type = node.data('modeltype');
  }

  const suc = getSuccessors(node, type);

  if (suc.length === 0) {
    return node;
  }

  // check direct successor
  const dir_suc = getDirectSuccessor(node);
  let isLeave = false;
  for (let i = 0; i < dir_suc.length; i++) {
    if (dir_suc[i].data('modeltype') !== type) {
      isLeave = true;
      break;
    }
  }

  if (isLeave) {
    leaves.push(node);
  }

  // check successor
  for (let i = 0; i < suc.length; i++) {
    const node_check = suc[i];
    if (node_check.data('modeltype') === type) {
      const dirSucNode = getDirectSuccessor(node_check);

      if (dirSucNode.length === 0) {
        leaves.push(node_check);
      } else {
        for (let j = 0; j < dirSucNode.length; j++) {
          if (dirSucNode[j].data('modeltype') !== type) {
            leaves.push(node_check);
          }
        }
      }
    }
  }

  return leaves;
}

export function filterNodes(graph, filter){
  // style: directdemand, indirectdemand, obsolete, violated, changedElement, between
  // type: infra, businessprocess, complianceprocess, compliance
  const { style } = filter;
  const { type } = filter;
  const result = [];
  const nodes = graph.nodes();

  if (style !== undefined && type !== undefined) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeStyle = node.data('nodestyle');
      const nodeType = node.data('nodetype');

      if (nodeStyle === style && nodeType === type) {
        result.push(node);
      }
    }
    return result;
  }

  if (style === undefined && type !== undefined) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeType = node.data('nodetype');

      if (nodeType === type) {
        result.push(node);
      }
    }
    return result;
  }

  if (style !== undefined && type === undefined) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeStyle = node.data('nodestyle');

      if (nodeStyle === style) {
        result.push(node);
      }
    }
    return result;
  }
  return null;
}

export function isUniqueNode(graph, input){
  let { id } = input;
  const { node } = input;
  const nodes = graph.nodes();

  if (node !== undefined){
    id = node.data('id');
  }

  for (let i = 0; i < nodes.length; i++){
    if (nodes[i].id() === id) {
      return false;
    }
  }
  return true;
}

export function edgeExist(graph, sourceID, targetID){
  const edgeID = `${sourceID}_${targetID}`;
  const exist = graph.getElementById(edgeID);

  if (exist.length > 0){
    return true;
  }
  return false;
}

export function getPropsValue(props, key) {
  const result = [];
  for (let i = 0; i < props.length; i++) {
    const entry = props[i];
    if (entry.key === key){
      result.push(entry.value);
    }
  }
  return result;
}

export function getBusinessActivities(graph) {
  const businessNodes = filterNodes(graph, { type: 'businessprocess' });
  const result = [];

  for (let i = 0; i < businessNodes.length; i++){
    const node = businessNodes[i];
    if (node.data('name') !== undefined) {
      result.push({ name: node.data('name'), id: node.data('id') });
    }
  }
  return result;
}

export function getInfraElements(graph) {
  const infraNodes = filterNodes(graph, { type: 'infra' });
  const result = [];

  for (let i = 0; i < infraNodes.length; i++){
    const node = infraNodes[i];
    if (node.data('name') !== undefined) {
      result.push({ name: node.data('name'), id: node.data('id') });
    }
  }
  return result;
}

export function getComplianceProcesses(graph) {
  const cp = filterNodes(graph, { type: 'complianceprocess' });
  const result = [];

  for (let i = 0; i < cp.length; i++){
    const node = cp[i];
    if (node.data('name') !== undefined) {
      result.push({
        name: node.data('name'),
        id: node.data('id'),
        props: node.data('props'),
      });
    }
  }
  return result;
}
