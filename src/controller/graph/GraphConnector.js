import cytoscape from 'cytoscape';
import * as GraphCreator from './GraphEditor';
import * as InfraQuery from './../infra/InfraQuery';
import * as ProcessQuery from './../process/ProcessQuery';
import * as ProcessEditor from './../process/ProcessEditor';
import * as ProcessRenderer from './../process/ProcessRenderer';
import ProjectModel from '../../models/ProjectModel';

export function addSubGraphs(options) {
  const { process } = options;
  const { infra } = options;
  let graph = ProjectModel.getGraph();

  if (graph === null){
    graph = cytoscape({
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#ffffff',
            'border-style': 'solid',
            'border-color': '#666',
            'border-width': 4,
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
  }

  if (process !== undefined) {
    GraphCreator.createGraphFromProcess(graph, process);
  } else if (infra !== undefined) {
    GraphCreator.createGraphFromInfra(graph, infra);
  }

  ProjectModel.setGraph(graph);
}

export function linkRequirement2Process(viewer, graph, shape, requirement) {
  const { businessObject } = shape;
  const extension = ProcessEditor.createExtensionElement('compliance', requirement.id);
  const isUniqueExt = ProcessQuery.isUniqueExtension(businessObject, extension);

  if (isUniqueExt) {
    ProcessEditor.addExtension(viewer, businessObject, extension); // 1. zu props flowelement hinzufügen
    GraphCreator.updateFlownodeProperty(graph, businessObject); // 3. graph in graphviewer updaten
    GraphCreator.addNodes(graph, { requirement, businessObject }); // 4. create and link nodes
    ProcessRenderer.addExtensionShape(viewer, shape, { compliance: requirement }, extension); // 5. add DataObject to process model
  }

  return isUniqueExt;
}

export function linkInfra2Process(viewer, graph, shape, itComponent) {
  const { businessObject } = shape;

  if (!businessObject.$type.toLowerCase().includes('data')) {
    const extension = ProcessEditor.createExtensionElement('infra', itComponent.id);
    const isUniqueExt = ProcessQuery.isUniqueExtension(businessObject, extension);

    if (isUniqueExt) {
      ProcessEditor.addExtension(viewer, businessObject, extension); // 1. zu props flowelement hinzufügen
      GraphCreator.updateFlownodeProperty(graph, businessObject); // 2. graph in graphviewer updaten
      GraphCreator.addNodes(graph, { itComponent, businessObject }); // 3. create and link nodes
      ProcessRenderer.addExtensionShape(viewer, shape, { infra: itComponent }, extension); // 4. add DataObject to process model
    } else {
      return false;
    }
  }
  return null;
}

export function linkRequirement2Requirement(graph, source_requirement, target_requirement) {
  GraphCreator.addNodes(graph, { requirement: source_requirement, requirement_2: target_requirement });
}

export function linkRequirement2Infra(graph, graphInfra, requirement, itComponent) {
  if (itComponent != null) {
    const isUniqueProp = InfraQuery.isUniqueProp(itComponent, { requirement });
    if (isUniqueProp) { // if new Props are added
      GraphCreator.updateITComponentProperty(graph, itComponent); // 4. graph in graphviewer updaten
      GraphCreator.addNodes(graph, { requirement, itComponent }); // 5. create and link nodes
      GraphCreator.updateITDisplayName(graph, graphInfra, itComponent); // 6. update Displayname IT Component
    }
  }
}

export function updateITComponent(graph, graphInfra, itComponent) {
  GraphCreator.updateITComponentProperty(graph, itComponent); // update node.data('props')
  GraphCreator.updateNeighborsBasedOnProps(graph, itComponent); // remove edges
  GraphCreator.updateITDisplayName(graph, graphInfra, itComponent); // update Displayname IT Component
}

export function updateFlowelement(viewer, graph, flowelement) {
  GraphCreator.updateFlownodeProperty(graph, flowelement);
  GraphCreator.updateComplianceNode(graph, flowelement);
  GraphCreator.updateNeighborsBasedOnProps(graph, flowelement);
  ProcessRenderer.removeExtensionShape(viewer, flowelement);
}
