import * as GraphEditor from './../graph/GraphEditor';
import * as GraphQuery from './../graph/GraphQuery';

export function getProcess(viewer, e) {
  let process;

  if (e === null || e === undefined) {
    const elementRegistry = viewer.get('elementRegistry');
    const nodes = elementRegistry.getAll();

    // console.log(nodes); // todo collaboration berücksichtigen um process zu bestimmen

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].businessObject.$type === 'bpmn:Process') {
        process = nodes[i].businessObject;
        break;
      }
    }
  } else {
    const elementRegistry = viewer.get('elementRegistry');
    const nodeElement = elementRegistry.get(e.element.id);
    const node = nodeElement.businessObject;
    process = elementRegistry.get(node.$parent.id);
  }

  return process;
}

export function getShapes(viewer){
  const elementRegistry = viewer.get('elementRegistry');
  const nodes = elementRegistry.getAll();
  const shapes = [];

  for (let i = 0; i < nodes.length; i++) {
    const shape = nodes[i];
    shapes.push(shape);
  }
  return shapes;
}

// final
export function getFlowElementsOfProcess(process) {
  const flowElements = [];

  if (process.flowElements === undefined) {
    return null;
  }
  for (let i = 0; i < process.flowElements.length; i++) {
    flowElements.push(process.flowElements[i]);
  }

  return flowElements;
}

// final
export function getSequenceFlowsofProcess(process) {
  const flowElements = getFlowElementsOfProcess(process);
  const sequence = [];

  if (flowElements != null) {
    for (let i = 0; i < flowElements.length; i++) {
      if (flowElements[i].$type.includes('SequenceFlow')) {
        sequence.push(flowElements[i]);
      }
    }
    return sequence;
  }
  return null;
}

// final
export function getElementOfRegistry(viewer, id) {
  const elementRegistry = viewer.get('elementRegistry');
  const element = elementRegistry.get(id);

  return element.businessObject;
}

export function getShapeOfRegistry(viewer, id){
  const elementRegistry = viewer.get('elementRegistry');
  return elementRegistry.get(id);
}

export function getSequenceFlow(sourceShape, targetShape){
  const process = sourceShape.businessObject.$parent;
  const sequenceFlows = getSequenceFlowsofProcess(process);

  for (let i = 0; i < sequenceFlows.length; i++){
    const sequenceFlow = sequenceFlows[i];
    const sourceID = sequenceFlow.sourceRef.id;
    const targetID = sequenceFlow.targetRef.id;

    if (sourceID === sourceShape.id && targetID === targetShape.id){
      return sequenceFlow;
    }
  }
  return null;
}

// final
export function getFlowNodesOfProcess(process) {
  const flowElements = getFlowElementsOfProcess(process);
  const nodes = [];

  if (flowElements != null) {
    for (let i = 0; i < flowElements.length; i++) {
      if (!flowElements[i].$type.includes('SequenceFlow')) {
        nodes.push(flowElements[i]);
      }
    }
    return nodes;
  }
  return null;
}

// final
export function getFlowElementById(process, id) {
  const flowElements = getFlowElementsOfProcess(process);

  for (let i = 0; i < flowElements.length; i++) {
    if (flowElements[i].id === id) {
      return flowElements[i];
    }
  }
  return null;
}

// final
export function getFlowNodeByType(process, type) {
  const result = [];
  const nodes = getFlowNodesOfProcess(process);

  for (let i = 0; i < nodes.length; i++) {
    const _type = nodes[i].$type;
    if (_type === type) {
      result.push(nodes[i]);
    }
  }
  return result;
}

// final
export function getExtensionOfElement(businessObject) {
  let extensionElements = [];
  const result = [];
  let _name;
  let _value;

  if (businessObject.extensionElements !== undefined) {
    if (businessObject.extensionElements.values !== undefined) {
      extensionElements = businessObject.extensionElements.values;
      for (let i = 0; i < extensionElements.length; i++) {
        if (extensionElements[i].$children !== undefined) { // get camunda extension
          for (let j = 0; j < extensionElements[i].$children.length; j++) {
            _name = extensionElements[i].$children[j].name;
            _value = extensionElements[i].$children[j].value;
            result.push({ name: `${_name} ${_value}`, _name, _value });
          }
        } else { // get own extension
          _name = extensionElements[i].name;
          _value = extensionElements[i].value;
          result.push({ name: `${_name} ${_value}`, _name, _value });
        }
      }
    }
  }
  return result;
}

export function hasExtension(businessObject, name, value) {
  const props = getExtensionOfElement(businessObject);

  if (props !== undefined) {
    if (value === undefined) {
      for (let i = 0; i < props.length; i++) { // check if the element has an extension of name
        if (props[i]._name === name) {
          return true;
        }
      }
    } else {
      for (let i = 0; i < props.length; i++) { // check if the node is a compliance process
        if (props[i]._name === name && props[i]._value === value) {
          return true;
        }
      }
    }
  }
  return false;
}

// final
export function isCompliance(element) {
  const name = 'isComplianceProcess';
  const value = 'true';

  return hasExtension(element, name, value);
}

// final
export function isCompliancePattern(element) {
  const name = 'isComplianceProcessPattern';
  const value = 'true';

  return hasExtension(element, name, value);
}

// final
export function hasExtensionName(businessObject, name) {
  const props = getExtensionOfElement(businessObject);
  for (let i = 0; i < props.length; i++) { // check if the element has an extension of name
    if (props[i]._name === name) {
      return true;
    }
  }
  return false;
}

export function isExtensionShape(shape) {
  const { businessObject } = shape;
  return hasExtension(businessObject, 'flowelement');
}

export function isComplianceExtensionShape(shape) {
  const { businessObject } = shape;
  return hasExtension(businessObject, 'compliance');
}

// final
export function isFlowElement(option) { // identify flowNodes
  const { element } = option;
  const { shape } = option;
  let { type } = null;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape;
  }

  type = type.toLowerCase();
  return ((!type.includes('data')) && (!type.includes('sequence')));
}

// final
export function isDataObject(businessObject) { // identify Database or Document
  return (businessObject.$type.includes('DataObject'));
}

export function isDataStore(businessObject) {
  return (businessObject.$type.includes('DataStore'));
}

export function isDataObjectRef(option) {
  const { element } = option;
  const { shape } = option;
  let type = null;

  if (element !== null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape;
  }

  type = type.toLowerCase();

  return (type.includes('dataobject'));
}

// final
export function isUniqueExtension(businessObject, extension) {
  if (businessObject.extensionElements === undefined) {
    return true;
  }

  const ext = businessObject.extensionElements.get('values');

  for (let i = 0; i < ext.length; i++) {
    if (ext[i].name === extension.name && ext[i].value === extension.value) { // change back to ._name, ._value??
      return false;
    }
  }

  return true;
}

// final
export function getIdFromExtensionShape(element) {
  const { businessObject } = element;
  const shapeExtension = getExtensionOfElement(businessObject);

  /*
  for (let i = 0; i < shapeExtension.length; i++) {
    const { name } = shapeExtension[i];
    const { value } = shapeExtension[i];
    if (name !== 'flowelement') {
      console.log(value);
      return value;
    }
  }
  */

  for (let i = 0; i < shapeExtension.length; i++) {
    const { _name } = shapeExtension[i];
    const { _value } = shapeExtension[i];
    if (_name !== 'flowelement') {
      return _value;
    }
  }
  return null;
}

export function isTaskOrSubprocess(input) {
  let { type } = input;
  type = type.toLowerCase();
  return (type.includes('task') || type.includes('subprocess'));
}

export function getDataInputShapes(viewer, shape){
  const result = [];
  const { businessObject } = shape;

  if (businessObject.dataInputAssociations !== undefined){
    for (let i = 0; i < businessObject.dataInputAssociations.length; i++){
      const input = businessObject.dataInputAssociations[i];
      const sourceId = input.sourceRef[0].id;
     // console.log(sourceId);
      const inputShape = getShapeOfRegistry(viewer, sourceId);
      result.push(inputShape);
    }
  }

  /*
  console.log('ergebnisse der input');
  console.log(businessObject);
  console.log(result);
  */

  return result;
}

export function getDataOutputShapes(viewer, shape){
  const result = [];
  const { businessObject } = shape;

  if (businessObject.dataOutputAssociations !== undefined){
    for (let i = 0; i < businessObject.dataOutputAssociations.length; i++){
      const output = businessObject.dataOutputAssociations[i];
      // console.log(output);
      const targetId = output.targetRef.id;
      const outputShape = getShapeOfRegistry(viewer, targetId);
      result.push(outputShape);
    }
  }
  return result;
}

// final
export function getDirectSucessors(businessObject) {
  const result = [];

  if (businessObject.outgoing !== undefined) {
    const { outgoing } = businessObject;

    for (let i = 0; i < outgoing.length; i++) {
      result.push(outgoing[i].targetRef);
    }
    return result; // array of flownodes
  }
  return null;
}

export function getSucessorShapes(viewer, shape){
  const process = shape.businessObject.$parent;
  const graph = GraphEditor.getEmptyGraph();
  GraphEditor.createGraphFromProcess(graph, process);

  const node = graph.getElementById(shape.id);
  const sucs = GraphQuery.getSuccessors(node);
  const result = [];

  for (let i = 0; i < sucs.length; i++){
    const suc = sucs[i];
    const shapeSuc = getShapeOfRegistry(viewer, suc.id());
    result.push(shapeSuc);
  }

  return result;
}

/*
export function getPredecessorShapes(viewer, shape){
  const process = shape.businessObject.$parent;
  const graph = GraphEditor.getEmptyGraph();
  GraphEditor.createGraphFromProcess(graph, process);

  const node = graph.getElementById(shape.id);
  const preds = GraphQuery.getPredecessors(node);
  const result = [];

  for (let i = 0; i < preds.length; i++){
    const pred = preds[i];
    const shapePred = getShapeOfRegistry(viewer, pred.id());
    result.push(shapePred);
  }

  return result;
}

*/

/*
export function getSuccessors(viewer, id){
  const process = getProcess(viewer);
  const graph = GraphEditor.getEmptyGraph();
  GraphEditor.createGraphFromProcess(graph, process);

  const node = graph.getElementById(id);
  const sucs = GraphQuery.getSuccessors(node);
  const result = [];

  for (let i = 0; i < sucs.length; i++){
    const suc = sucs[i];
    result.push(suc.id());
  }

  return result;
}
*/


/*
export function getPredecessors(viewer, id){

}
*/

// testen
export function getDirectPredecessors(businessObject) {
  const result = [];

  if (businessObject.incoming !== undefined) {
    const { incoming } = businessObject;

    for (let i = 0; i < incoming.length; i++) {
      result.push(incoming[i].sourceRef);
    }
    return result;
  }
  return null;
}

/*
// todo: testen mit Parallelitäten in Parallität und Exklusivität
function getParallelTrace(node, parallelTrace) {
  const sucs = getDirectSucessors(node);

  if (parallelTrace === undefined) {
    const _parallelTrace = [];

    for (let i = 0; i < sucs.length; i++) {
      const sequence = [];
      _parallelTrace.push({ status: 'open', sequence });
    }
    return getParallelTrace(node, _parallelTrace);
  }
  let finished = true;
  const _parallelTrace = [];

  for (let i = 0; i < parallelTrace.length; i++) {
    const _trace = parallelTrace[i];
    // console.log('trace', _trace);

    if (_trace.status === 'open') {
      finished = false;
      let _node;
      let suc;

      if (_trace.sequence.length === 0) {
        _node = node;
        suc = getDirectSucessors(_node)[i];
      } else {
        _node = _trace.sequence[_trace.sequence.length - 1];
        suc = getDirectSucessors(_node)[0];
      }

      if (suc.$type === 'bpmn:ParallelGateway') {
        if (getDirectSucessors(node).length === getDirectPredecessors(suc).length) {
          _trace.status = 'closed';
        } else {
          // let trace = getParallelTrace(_node);
        }
      } else if (_node.$type === 'bpmn:ExclusiveGateway') {
        // todo: weiter bauen
        console.log('test');
      } else {
        _trace.sequence.push(suc);
      }
    }
    _parallelTrace.push(_trace);
  }

  if (finished) {
    return parallelTrace;
  }
  return getParallelTrace(node, _parallelTrace);
}
*/

/*
// todo: testen
function searchTrace(openTraces, finalTraces, endNode) {
  const help = []; // openTraces
  const _finalTraces = finalTraces;

  for (let i = 0; i < openTraces.length; i++) {
    const openTrace = openTraces[i];
    const node = openTrace[openTrace.length - 1];
    const sucs = getDirectSucessors(node);

    if ((node.$type === 'bpmn:ExclusiveGateway')) {
      for (let j = 0; j < sucs.length; j++) {
        const newTrace = [];
        Array.prototype.push.apply(newTrace, openTrace);
        newTrace.push(sucs[j]);
        help.push(newTrace);
      }
    } else if ((node.$type === 'bpmn:ParallelGateway')) {
      for (let j = 0; j < sucs.length; j++) {
        const parallelTrace = getParallelTrace(node);
        Array.prototype.push.apply(openTrace, parallelTrace);
      }

      const closingParallel = getDirectSucessors(openTrace[openTrace.length - 1].sequence[0])[0];
      openTrace.push(closingParallel);
      const suc = getDirectSucessors(closingParallel)[0];
      openTrace.push(suc);
      help.push(openTrace);
    } else if (node === endNode) {
      _finalTraces.push(openTrace);
    } else {
      for (let j = 0; j < sucs.length; j++) {
        openTrace.push(sucs[j]);
      }
      help.push(openTrace);
    }
  }

  if (help.length === 0) {
    return _finalTraces;
  }
  return searchTrace(help, _finalTraces, endNode);
}
*/

/*
// todo: testen
export function getTraces(process) {
  const finalTraces = [];
  const openTraces = [];
  const trace = [];

  const startNode = getFlowNodeByType(process, 'bpmn:StartEvent')[0];
  const endNode = getFlowNodeByType(process, 'bpmn:EndEvent')[0];

  trace.push(startNode);
  openTraces.push(trace);

  return searchTrace(openTraces, finalTraces, endNode);
}
*/

export function getStartShape() {

}