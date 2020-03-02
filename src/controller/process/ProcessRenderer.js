import * as queryprocess from './ProcessQuery';
import * as editprocess from './ProcessEditor';
import * as ProcessRenderer from './ProcessRenderer';
import * as ComplianceQuery from './../compliance/ComplianceQuery';
import Projectmodel from './../../models/ProjectModel';

// final
export function colorShape(viewer, shape, coloroption) {
  const modeling = viewer.get('modeling');
  const _stroke = coloroption.stroke || 'black';
  const _fill = coloroption.fill || 'white';

  modeling.setColor(shape, { stroke: _stroke, fill: _fill });
}

export function resetShapeColor(viewer) {
  // get Shapes of Process
  const shapes = queryprocess.getShapes(viewer);

  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    const isCompliance = queryprocess.isCompliance(shape.businessObject);
    const isFlowNode = queryprocess.isTaskOrSubprocess(shape);
    const isExtShape = queryprocess.isExtensionShape(shape);

    if (isFlowNode) {
      if (isCompliance) {
        colorShape(viewer, shapes[i], { stroke: 'black', fill: 'grey' });
      } else {
        colorShape(viewer, shapes[i], { stroke: 'black', fill: 'white' });
      }
    } else {
      if (isExtShape) {
        colorShape(viewer, shapes[i], { stroke: 'grey', fill: 'white' });
      }
    }
  }
}

export function highlightShapeOnClick(shape, selected, modeler) {

  if (shape !== null && shape !== undefined) {
    const isCompliance = queryprocess.isCompliance(shape.businessObject);
    const isExtensionShape = queryprocess.isExtensionShape(shape);
    if (selected) {
      if (isCompliance) {
        ProcessRenderer.colorShape(modeler, shape, { fill: 'grey', stroke: '#017ADC' });
      } else {
        ProcessRenderer.colorShape(modeler, shape, { fill: 'white', stroke: '#017ADC' });
      }
    } else {
      if (isCompliance) {
        ProcessRenderer.colorShape(modeler, shape, { fill: 'grey', stroke: 'black' });
      } else {
        if (isExtensionShape) {
          ProcessRenderer.colorShape(modeler, shape, { fill: 'white', stroke: 'grey' });
        } else {
          ProcessRenderer.colorShape(modeler, shape, { fill: 'white', stroke: 'black' });
        }
      }
    }
  }
}

export function createShape(viewer, option) {
  const canvas = viewer.get('canvas');
  const elementFactory = viewer.get('elementFactory');
  const modeler = viewer.get('modeling');

  const posX = option.x || 50;
  const posY = option.y || 50;
  const { type } = option || 'bpmn:Task';
  const { name } = option;

  const root = canvas._rootElement;
  const shape = elementFactory.create('shape', { // https://github.com/bpmn-io/bpmn-js/issues/669
    type,
  });

  modeler.createShape(shape, { x: posX, y: posY }, root);
  modeler.updateLabel(shape, name);

  return shape;

  // shape types

  // bpmn:EndEvent
  // bpmn:StartEvent
  // bpmn:Task
  // bpmn:SubProcess

  // bpmn:DataStoreReference
  // bpmn:DataObjectReference

  // bpmn:ParallelGateway
  // bpmn:ExclusiveGateway
}

// final
export function removeShape(viewer, shape) {
  const modeler = viewer.get('modeling');

  try {
    modeler.removeShape(shape);
  } catch (err) {
    console.log(err);
  }
}

// final
export function updateShape(viewer, shape, option) {
  const modeler = viewer.get('modeling');
  const _option = option || { id: 'neueid' };

  modeler.updateProperties(shape, _option);
  return shape;
}

export function moveShape(viewer, shape, direction) {
  const modeler = viewer.get('modeling');
  let xPos;
  let yPos = shape.y;

  if (direction === undefined) {
    xPos = (shape.x / 2);
  } else if (direction === 'left'){
    xPos = (-1 * shape.width);
  }

  modeler.moveShape(shape, { x: xPos, y: 0 }, false);

  // move labels of shapes
  if (shape.label !== undefined) {
    modeler.moveShape(shape.label, { x: xPos, y: 0 }, false);
  }

  // move DataInput of the activity
  const dataInputs = queryprocess.getDataInputShapes(viewer, shape);
  for (let i = 0; i < dataInputs.length; i++){
    const dataInput = dataInputs[i];
    yPos = (shape.y / 2) - 51;
    modeler.moveShape(dataInput, { x: xPos, y: 0 }, false);

    const shapeLabel = dataInput.label;
    modeler.moveShape(shapeLabel, { x: xPos, y: 0 }, false);
  }

  // move DataOutput of the activity
  const dataOutputs = queryprocess.getDataOutputShapes(viewer, shape);

  for (let i = 0; i < dataOutputs.length; i++){
    const dataOutput = dataOutputs[i];
    yPos = (shape.y / 2) - 51;
    modeler.moveShape(dataOutput, { x: xPos, y: 0 }, false);
    const shapeLabel = dataOutput.label;
    modeler.moveShape(shapeLabel, { x: xPos, y: 0 }, false);
  }
}

// final
export function connectShapes(viewer, source, target) {
  const modeler = viewer.get('modeling');
  return modeler.connect(source, target);
}

// final
function getTopPosition(viewer) {
  const elementRegistry = viewer.get('elementRegistry');
  const shapeCollection = elementRegistry.getAll();
  let top = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    const shape = shapeCollection[i];

    if (!queryprocess.isExtensionShape(shape)) { // check if shape is a modelled extension
      if (shape.y !== undefined) {
        if (top === 0) {
          top = shape.y;
        }
        if (shape.y < top) {
          top = shape.y;
        }
      }
    }
  }
  return top;
}

// final
function getBottomPosition(viewer) {
  const elementRegistry = viewer.get('elementRegistry');
  const shapeCollection = elementRegistry.getAll();
  let bottom = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    const shape = shapeCollection[i];

    if (!queryprocess.isExtensionShape(shape)) { // check if shape is a modelled as extension
      if (shape.y !== undefined) {
        if (bottom === 0) {
          bottom = shape.y;
        }
        if (shape.y > bottom) {
          bottom = shape.y;
        }
      }
    }
  }
  return bottom;
}

function getVerticalMiddlePosition(shape) {
  return shape.y + (shape.height/2);
}

export function getVerticalPosition(shape, prevShape) {
  const middle = getVerticalMiddlePosition(prevShape);
  const y = middle - shape.height / 2;
  return y;
}

// final
export function addExtensionShape(viewer, element, option, extension) {
  const { infra } = option;
  const { compliance } = option;

  let _name;
  let _type;
  const _x = element.x + (element.width / 2);
  let _y;

  // define shape type
  if (infra != null) {
    _name = infra.name;
    _type = 'bpmn:DataStoreReference';
    _y = getBottomPosition(viewer) + element.height + 100;
  }

  if (compliance != null) {
    _name = compliance.title;

    // Workaround to get the compliance title
    if (_name === undefined) {
      const complianceList = Projectmodel.getCompliance();
      const req = ComplianceQuery.getRequirementById(Projectmodel.getCompliance().requirement, compliance.id);
      _name = req.title;
    }

    _type = 'bpmn:DataObjectReference';
    _y = getTopPosition(viewer) - element.height - 20;
  }

  // create shape and get its element
  const dataShape = createShape(viewer, {
    name: _name, type: _type, x: _x, y: _y,
  });

  // extend the element
  if (extension !== undefined) {
    const dataElement = dataShape.businessObject;
    editprocess.addExtension(viewer, dataElement, extension);
    const ext = editprocess.createExtensionElement('flowelement', element.id);
    editprocess.addExtension(viewer, dataElement, ext);
  }

  // connect created shape with flownode and color it
  // connectShapes(viewer, dataShape, element);
  colorShape(viewer, dataShape, { stroke: 'grey' });

  // todo DataOutput bei ComplianceProcess definieren
  // determine element is compliance -> switch edge direction
  const isCompliance = queryprocess.isCompliance(element.businessObject);
  const isDataObject = queryprocess.isDataObject(dataShape.businessObject);
  if (isCompliance && isDataObject) {
    connectShapes(viewer, element, dataShape);
  } else {
    connectShapes(viewer, dataShape, element);
  }
}

// final
export function removeExtensionShape(viewer, flowelement) {
  const elementRegistry = viewer.get('elementRegistry');
  const shapes = elementRegistry.getAll();
  const extShapes = []; // determine extension shapes belong to flowelement
  const shapesToRemove = [];

  // 1. get all extensionShapes that belongs to the selected flowelement--> done
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const element = shape.businessObject;
    const isExtShape = queryprocess.isExtensionShape(shape);
    const belongsToFlowelement = queryprocess.hasExtension(element, 'flowelement', flowelement.id);

    if (isExtShape && shape.type !== 'label' && belongsToFlowelement) {
      extShapes.push(shape);
    }
  }
  // console.log(extShapes);

  // 2. get value Extension of flowelement
  const ext = queryprocess.getExtensionOfElement(flowelement);
  const valueFlowelement = [];
  const valueShape = [];

  for (let i = 0; i < ext.length; i++) {
    const { _value } = ext[i];
    valueFlowelement.push(_value);
  }
  // console.log('valueFlowElements', valueFlowelement);

  // 3. get ID of Requirement or ITComponent stored in the ShapeExtension
  for (let i = 0; i < extShapes.length; i++) {
    const shape = extShapes[i];
    const id = queryprocess.getIdFromExtensionShape(shape);
    valueShape.push({ shape, value: id });
  }
  // console.log('valueShape',valueShape);

  // 4a check wheather flowelement has no extension
  if (valueFlowelement.length === 0) {
    for (let i = 0; i < extShapes.length; i++) {
      const shape = extShapes[i];
      shapesToRemove.push(shape);
    }
  }

  // 4b. check weather ID of Requirement or ITComponent is in valueFlowElements
  if (valueFlowelement.length > 0) {
    let del = true;

    for (let i = 0; i < valueShape.length; i++) {
      const valueS = valueShape[i].value;
      // console.log('valueShapeExt', valueS);
      for (let j = 0; j < valueFlowelement.length; j++) {
        const valueF = valueFlowelement[j];
        // console.log('valueFlowelement', valueF);

        if (valueF === valueS) {
          del = false;
        }
      }

      if (del) {
        shapesToRemove.push(valueShape[i].shape);
      } else {
        del = true;
      }
    }
  }

  // 5. delete shapes
  // console.log('shapes to remove', shapesToRemove);
  for (let i = 0; i < shapesToRemove.length; i++) {
    const shape = shapesToRemove[i];
    // console.log('remove shape', shape);
    removeShape(viewer, shape);
  }
}

/*
function getViewerComponents(viewer) { // Möglichkeiten des Viewers
  const elementRegistry = viewer.get('elementRegistry');
  const overlays = viewer.get('overlays');
  const canvas = viewer.get('canvas');
  const elementFactory = viewer.get('elementFactory');
  const modeler = viewer.get('modeling');
}
*/

export function renderComplianceProcess(viewer, element, isCompliance) {
  if (isCompliance) {
    colorShape(viewer, element, { fill: 'grey' });
  } else {
    colorShape(viewer, element, { fill: 'white' });
  }
}

export function integrateShapeSequential(viewer, newShape, oldShape, position){
  if (position === 'before'){
    const dirPreds = queryprocess.getDirectPredecessors(oldShape.businessObject);
    for (let i = 0; i < dirPreds.length; i++){
      const pred = dirPreds[i];
      const shapePred = queryprocess.getShapeOfRegistry(viewer, pred.id);
      connectShapes(viewer, shapePred, newShape); // connect shape with suc of old shape

      const sf = queryprocess.getSequenceFlow(shapePred, oldShape);
      const sfShape = queryprocess.getShapeOfRegistry(viewer, sf.id);
      removeShape(viewer, sfShape);
    }
    connectShapes(viewer, newShape, oldShape); // connect old shape and new shape
  } else if (position === 'after'){
    const dirSucs = queryprocess.getDirectSucessors(oldShape.businessObject);
    for (let i = 0; i < dirSucs.length; i++){
      const suc = dirSucs[i];
      const shapeSuc = queryprocess.getShapeOfRegistry(viewer, suc.id);
      connectShapes(viewer, newShape, shapeSuc); // connect shape with suc of old shape

      const sf = queryprocess.getSequenceFlow(oldShape, shapeSuc);
      const sfShape = queryprocess.getShapeOfRegistry(viewer, sf.id);
      removeShape(viewer, sfShape);
    }
    connectShapes(viewer, oldShape, newShape); // connect old shape and new shape
  }
}
