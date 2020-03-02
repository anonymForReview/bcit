// contains functions to create alternative business processes
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import ProjectModel from './../../models/ProjectModel';
import * as ProcessQuery from '../process/ProcessQuery';
import * as ProcessRenderer from '../process/ProcessRenderer';
import * as ProcessEditor from '../process/ProcessEditor';
import * as GraphQuery from '../graph/GraphQuery';
import * as AlternativeFinder from './AlternativeFinder';
import * as FileIo from './../../controller/helpers/fileio';
import * as InfraQuery from './../infra/InfraQuery';

async function getModeler(bpmnXml) {
  const promise = new Promise((res) => {
    const modeler = new BpmnModeler();
    modeler.importXML(bpmnXml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        res(modeler);
      }
    });
  });
  return promise;
}

function insertShape(predShape, altNode, viewer) {
  const posX = predShape.x + predShape.width + 200;
  const posY = predShape.y;
  const sucs = ProcessQuery.getSucessorShapes(viewer, predShape);

  for (let i = sucs.length - 1; i >= 0; i--){
    ProcessRenderer.moveShape(viewer, sucs[i]);
  }

  const name = altNode.data('name');
  const type = altNode.data('nodetype');

  const newShape = ProcessRenderer.createShape(viewer, {
    x: posX, y: posY, type: 'bpmn:Task', name,
  });

  if (type === 'complianceprocess') {
    ProcessEditor.defineAsComplianceProcess(viewer, newShape.businessObject, true);
    ProcessRenderer.colorShape(viewer, newShape, { fill: 'grey' });
  } else if (type === 'complianceprocesspattern') {
    ProcessEditor.defineAsComplianceProcessPattern(viewer, newShape.businessObject, true);
  }
  ProcessRenderer.integrateShapeSequential(viewer, newShape, predShape, 'after');

  // add compliance requirements as data to the process model
  const nodeReq = GraphQuery.filterNodesByType(GraphQuery.getSuccessors(altNode), 'compliance')[0];
  ProcessRenderer.addExtensionShape(viewer, newShape, { compliance: nodeReq.data() });
  addDataInputShapes(viewer, newShape, altNode);

  console.log('altNode', altNode);

  //workaround: move shape
  const verticalPos = ProcessRenderer.getVerticalPosition(newShape, predShape);
  const modeler = viewer.get('modeling');
  const move = verticalPos - newShape.y;
  modeler.moveShape(newShape, {x: 0,  y: move }, false);
}

function removeObsoleteShape(viewer, shape) {
  const sucs = ProcessQuery.getSucessorShapes(viewer, shape);
  const dataInputShapes = ProcessQuery.getDataInputShapes(viewer, shape);

  for (let j = 0; j < dataInputShapes.length; j++){
    const dataInputShape = dataInputShapes[j];
    ProcessRenderer.removeShape(viewer, dataInputShape);
  }

  const dataOutputShapes = ProcessQuery.getDataOutputShapes(viewer, shape);
  for (let j = 0; j < dataOutputShapes.length; j++){
    const dataOutputShape = dataOutputShapes[j];
    ProcessRenderer.removeShape(viewer, dataOutputShape);
  }
  ProcessRenderer.removeShape(viewer, shape);
  for (let j = 0; j < sucs.length; j++) {
    ProcessRenderer.moveShape(viewer, sucs[j], 'left');
  }
}

function removeObsoleteShapes(viewer, shapeList) {
  for (let i = 0; i < shapeList.length; i++) {
    const shape = shapeList[i];
    removeObsoleteShape(viewer, shape);
  }
}

function removeDataInputShapes(viewer, shape) {
  // remove data input shapes expect the compliance requirement
  const dataInputShapes = ProcessQuery.getDataInputShapes(viewer, shape);
  for (let j = 0; j < dataInputShapes.length; j++){
    const dataInputShape = dataInputShapes[j];
    if (ProcessQuery.isExtensionShape(dataInputShape) && !ProcessQuery.isComplianceExtensionShape(dataInputShape)) {
      // remove extension entry in flow shape
      const extElements = ProcessQuery.getExtensionOfElement(dataInputShape.businessObject);
      for (let i = 0; i < extElements.length; i++) {
        if (extElements[i]._name === 'infra') {
          ProcessEditor.removeExt(shape.businessObject.extensionElements, { name: 'infra', value: extElements[i]._value });
        }
      }
      ProcessRenderer.removeShape(viewer, dataInputShape);
    }
  }
}

function addDataInputShapes(viewer, shape, altNode) {
  // add infra as dataStore to the process model
  if (altNode.data('props') !== null) {
    const reqs = GraphQuery.getPropsValue(altNode.data('props'), 'req');
    const infra = ProjectModel.getInfra();
    for (let i = 0; i < reqs.length; i++) {
      const infraElement = InfraQuery.getElementById(infra, reqs[i]);
      ProcessRenderer.addExtensionShape(viewer, shape, { infra: infraElement });
    }
  }
}

function getShapes(modeler, queryResult) {
  const shapes = [];

  for (let i = 0; i < queryResult.length; i++) {
    const element = queryResult[i].data();
    const shape = ProcessQuery.getShapeOfRegistry(modeler, element.id);
    if (shape !== undefined) {
      shapes.push(shape);
    }

    // test extension shapes
    const shapesOfProcess = ProcessQuery.getShapes(modeler);
    for (let j = 0; j < shapesOfProcess.length; j++) {
      const extShape = shapesOfProcess[j];
      const id = ProcessQuery.getIdFromExtensionShape(extShape);

      if (id === element.id) {
        if (extShape.type !== 'label'){
          const extBO = extShape.businessObject;
          if (ProcessQuery.isDataObject(extBO) || ProcessQuery.isDataStore(extBO)) {
            shapes.push(extShape);
          }
        }
      }
    }
  }
  return shapes;
}

async function adaptBusinessProcessByAlternatives(alternative) {
  const modeler = await getModeler(ProjectModel.getBpmnXml());
  const violatedNode = alternative.violatedCP;
  const altNode = alternative.alternative;
  const type = altNode.data('nodetype');
  const violatedShape = ProcessQuery.getShapeOfRegistry(modeler, violatedNode.data('cpid'));

  // 1. check whether alternative is process or pattern
  // 2. if alternative is pattern
  if (type === 'complianceprocesspattern') {
    ProcessEditor.defineAsComplianceProcess(modeler, violatedShape.businessObject, false);
    ProcessRenderer.colorShape(modeler, violatedShape, { stroke: 'grey', fill: 'none' });
    ProcessEditor.defineAsComplianceProcessPattern(modeler, violatedShape.businessObject, true);
    ProcessRenderer.updateShape(modeler, violatedShape, { name: altNode.data('name') });
    removeDataInputShapes(modeler, violatedShape);
  }

  // 3. if alternative is process
  if (type === 'complianceprocess') {
    const triggerAlt = GraphQuery.getPropsValue(altNode.data('props'), 'trigger')[0];
    const triggerViolatedCP = GraphQuery.getPropsValue(violatedNode.data('props'), 'trigger')[0];

    if (triggerAlt === triggerViolatedCP) {
      ProcessRenderer.updateShape(modeler, violatedShape, { name: altNode.data('name') });
      removeDataInputShapes(modeler, violatedShape);
      addDataInputShapes(modeler, violatedShape, altNode);
    } else {
      const predShape = ProcessQuery.getShapeOfRegistry(modeler, triggerAlt);
      insertShape(predShape, altNode, modeler);
      removeObsoleteShape(modeler, violatedShape); // todo: auskommentieren
    }
  }
  return FileIo.getXmlFromViewer(modeler);
}

async function adaptBusinessProcess(alternative) {
  const modeler = await getModeler(ProjectModel.getBpmnXml());
  const altNode = alternative.alternative;
  const type = altNode.data('nodetype');

  // 3. if alternative is process
  if (type === 'complianceprocess') {
    const triggerAlt = GraphQuery.getPropsValue(altNode.data('props'), 'trigger')[0];
    const predShape = ProcessQuery.getShapeOfRegistry(modeler, triggerAlt); // todo: passendes Infra einfügen
    insertShape(predShape, altNode, modeler);
  }
  return FileIo.getXmlFromViewer(modeler);
}

export async function getAdaptedProcesses(altGraph, deleteGraph, bpmnXml){
  const adaptedProcesses = [];
  const violatedElements = GraphQuery.filterNodes(deleteGraph, { style: 'violated' });
  const obsoleteElements = GraphQuery.filterNodes(deleteGraph, { style: 'obsolete' });
  const modeler = await getModeler(bpmnXml);

  if (violatedElements.length === 0) {
    let obsoleteShapes = getShapes(modeler, obsoleteElements);
    const changedElement = GraphQuery.filterNodes(deleteGraph, { style: 'changedElement' });
    removeObsoleteShapes(modeler, obsoleteShapes);
    obsoleteShapes = getShapes(modeler, changedElement);
    removeObsoleteShapes(modeler, obsoleteShapes);
    adaptedProcesses.push({
      name: 'removed obsolete elements',
      bpmnXml: FileIo.getXmlFromViewer(modeler),
    });
  } else {
    const altEles = AlternativeFinder.getAlternatives(altGraph, deleteGraph, modeler);

    console.log('alternative', altEles);

    const violatedShapes = getShapes(modeler, violatedElements);
    const changedElement = GraphQuery.filterNodes(deleteGraph, { style: 'changedElement' });

    if ((changedElement.length > 0) && (changedElement[0].data('nodetype') === 'complianceprocess')) {
      violatedShapes.push(getShapes(modeler, changedElement)[0]);
    }
    // adapt process with alternatives
    if (altEles !== null) {
      for (let i = 0; i < altEles.length; i++) {
        const altEle = altEles[i];

        if (altEle.violatedCP === null) { // if BPC was checked there is no violatedCP
          const bpmnXml = await adaptBusinessProcess(altEle);
          const name = `compliant business process ${i + 1}`;
          adaptedProcesses.push({
            name,
            bpmnXml,
          });
        } else { // if compliant business process was changed
          const bpmnXml = await adaptBusinessProcessByAlternatives(altEle);
          const name = `compliant business process ${i + 1}`;
          adaptedProcesses.push({
            name,
            bpmnXml,
          });
        }
      }
    }
  }
  return adaptedProcesses;
}
