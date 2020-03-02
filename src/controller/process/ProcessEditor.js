import BpmnModdle from 'bpmn-moddle';

/*
// final
function addElements(viewer, process) {
  // https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/edit.js
  // https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/write.js
  const moddle = viewer.get('moddle'); // Moddle verändert das Datenmodell

  // mit moddle.create können beliebige BPMN-Objekte erzeugt werden
  const dataObject = moddle.create('bpmn:DataObject', { id: 'dataObject_2' });

  const database = moddle.create('bpmn:DataStore', { id: 'dataStore_2' });

  const task = moddle.create('bpmn:Task', { id: 'task_2', name: 'name' });

  // neue Objekte müssen an das Parent-Element gehangen werden

  task.dataObjectRef = dataObject;
  task.dataStoreRef = database;

  task.$parent = process;
  dataObject.$parent = process;
  database.$parent = process;

  process.flowElements.push(task);
  process.flowElements.push(dataObject);
  process.flowElements.push(database);
}
*/

export function addExtension(viewer, element, extension) {
  const moddle = viewer.get('moddle'); // Moddle verändert das Datenmodell
  const extensionElements = moddle.create('bpmn:ExtensionElements'); // moddle.create('bpmn:DataObject', {id: 'dataObject_2'}); // mit moddle.create können beliebige BPMN-Objekte erzeugt werden

  if (element.extensionElements === undefined) { // todo: bestehende Extension updaten
    element.extensionElements = extensionElements;
  }

  element.extensionElements.get('values').push(extension);
}

// final
export function createExtensionElement(name, value) {
  const moddle = new BpmnModdle();

  const extension = moddle.createAny('vendor:foo', 'http://vendor', {
    name,
    value,
  });
  return extension;
}

// final
export function removeExt(extensionElements, option) {
  const ext = extensionElements.get('values');
  const { name } = option;
  const { value } = option;
  const { remove } = option;
  let no;

  if (remove == null) {
    for (let i = 0; i < ext.length; i++) {
      if (ext[i].name === name && ext[i].value === value) {
        ext.splice(i, 1);
        break;
      }
    }
  } else {
    for (let i = 0; i < ext.length; i++){
      if (ext[i] === remove){
        no = i;
        break;
      }
    }
    ext.splice(no, 1);
  }
}

/*
// remove flowelement from repo and shape
function removeFlowelement(){

}
*/

// final
export function defineAsComplianceProcess(viewer, element, status) {
  if (status === true) { // if element shall be set as a compliance process
    const extension = createExtensionElement('isComplianceProcess', 'true');
    addExtension(viewer, element, extension);
  } else { // undo a set compliance process
    removeExt(element.extensionElements, { name: 'isComplianceProcess', value: 'true' });
  }
}

export function defineAsComplianceProcessPattern(viewer, element, status) {
  if (status === true) { // if element shall be set as a compliance process
    const extension = createExtensionElement('isComplianceProcessPattern', 'true');
    addExtension(viewer, element, extension);
  } else { // undo a set compliance process
    removeExt(element.extensionElements, { name: 'isComplianceProcessPattern', value: 'true' });
  }
}
