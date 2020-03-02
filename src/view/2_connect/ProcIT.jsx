import { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Growl } from 'primereact/growl';
import PropTypes from 'prop-types';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import cytoscape from 'cytoscape';
import * as ProcessQuery from '../../controller/process/ProcessQuery';
import * as ProcessEditor from '../../controller/process/ProcessEditor';
import * as ProcessRenderer from '../../controller/process/ProcessRenderer';
import * as GraphCreator from '../../controller/graph/GraphEditor';
import * as GraphConnector from '../../controller/graph/GraphConnector';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';
import * as InfraQuery from '../../controller/infra/InfraQuery';
import * as FileIO from '../../controller/helpers/fileio';
import ProjectModel from '../../models/ProjectModel';
import './../../App.css';

export default class StepProcIT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bpmnId: null,
      bpmnName: null,
      bpmnProps: [],
      bpmnProp: null,
      bpmnShape: null,
      isCompliance: false,
      infra: null,
      infraGraph: null,
      infraElement: null,
      infraElementId: null,
      infraElementName: null,
      infraElementProps: [],
      infraElementProp: null,
    };

    this.renderBpmnProps = this.renderBpmnProps.bind(this);
    this.removeInfraProp = this.removeInfraProp.bind(this);
    this.removeBpmnProp = this.removeBpmnProp.bind(this);
    this.setComplianceProcess = this.setComplianceProcess.bind(this);
    this.connectElements = this.connectElements.bind(this);
  }

  componentDidMount() {
    this.bpmnModeler = new BpmnModeler({
      container: '#canvas',
      height: '350px',
    });

    this.onMount();
    this.hookBpmnEventBus();
  }

  onMount(){
    if (ProjectModel.getBpmnXml() !== null) {
      this.renderBpmn(ProjectModel.getBpmnXml());
    }

    if (ProjectModel.getInfra() !== null) {
      const infra = ProjectModel.getInfra();
      this.setState({ infra }, () => {
        this.renderInfra(infra);
      });
    }
  }

  setComplianceProcess(e) {
    if (this.state.bpmnShape !== null) {
      const modeler = this.bpmnModeler;
      const element = this.state.bpmnShape;
      const { businessObject } = element;

      if (e.checked) {
        this.setState({ isCompliance: true }, () => this.renderBpmnProps(element));
        ProcessEditor.defineAsComplianceProcess(modeler, businessObject, true);
        ProcessRenderer.renderComplianceProcess(modeler, element, true);
      } else {
        this.setState({ isCompliance: false }, () => this.renderBpmnProps(element));
        ProcessEditor.defineAsComplianceProcess(modeler, businessObject, false);
        ProcessRenderer.renderComplianceProcess(modeler, element, false);
      }

      this.updateBusinessObject(businessObject);
      this.updateBpmnXml();

      // workaround for highlighting the selected element
      ProcessRenderer.highlightShapeOnClick(element, true, modeler);
    }
  }

  removeBpmnProp() {
    if (this.state.bpmnShape !== null && this.state.bpmnProp !== null) {
      const element = this.state.bpmnShape;
      const { businessObject } = element;

      ProcessEditor.removeExt(businessObject.extensionElements, {
        name: this.state.bpmnProp._name,
        value: this.state.bpmnProp._value,
      });
      this.setState({ bpmnShape: element });
      this.renderBpmnProps(element);
      const isCPP = ProcessQuery.isCompliance(businessObject);
      ProcessRenderer.renderComplianceProcess(this.bpmnModeler, element, isCPP);

      this.updateBusinessObject(businessObject);
      this.fitBpmnView();
      this.updateBpmnXml();
    }
  }

  updateBpmnXml(){
    const modeler = this.bpmnModeler;
    ProcessRenderer.resetShapeColor(modeler);
    const bpmnXml = FileIO.getXmlFromViewer(modeler);
    ProjectModel.setBpmnXml(bpmnXml);
    ProjectModel.setViewer(modeler);
  }

  updateBusinessObject(businessObject){
    const modeler = this.bpmnModeler;
    const graph = ProjectModel.getGraph();
    GraphConnector.updateFlowelement(modeler, graph, businessObject);
    ProjectModel.setGraph(graph);
  }

  fitBpmnView(){
    const canvas = this.bpmnModeler.get('canvas');
    canvas.zoom('fit-viewport');
  }

  hookBpmnOnClick(e) {
    const { element } = e;
    const modeler = this.bpmnModeler;
    if (ProcessQuery.isTaskOrSubprocess(element)) {
      ProcessRenderer.highlightShapeOnClick(this.state.bpmnShape, false, modeler);
      ProcessRenderer.highlightShapeOnClick(element, true, modeler);
      this.renderBpmnProps(element);
      this.setState({ bpmnShape: element });
    } else {
      ProcessRenderer.highlightShapeOnClick(this.state.bpmnShape, false, modeler);
      this.renderBpmnProps(null);
      this.setState({ bpmnShape: null });
    }
  }

  hookBpmnEventBus() {
    const eventBus = this.bpmnModeler.get('eventBus');
    eventBus.on('element.click', e => this.hookBpmnOnClick(e));
  }

  connectElements(){
    const shape = this.state.bpmnShape;
    const itComponent = this.state.infraElement;

    if (shape !== null && itComponent !== null) {
      const viewer = this.bpmnModeler;
      const graph = ProjectModel.getGraph();

      const isUnique = GraphConnector.linkInfra2Process(viewer, graph, shape, itComponent);
      if (isUnique !== false){
        this.renderBpmnProps(shape);
        this.fitBpmnView();
        this.updateBpmnXml();
        ProjectModel.setGraph(graph);

        const detail = `connect ${this.state.infraElementName} and ${this.state.bpmnName}`;
        this.growl.show({ severity: 'info', summary: 'elements connected', detail });
      } else {
        const detail = `${this.state.infraElementName} and ${this.state.bpmnName} are already connected`;
        this.growl.show({ severity: 'error', summary: 'elements already connected', detail });
      }
    }
  }

  hookInfraOnClick(graph){
    const _this = this;

    graph.on('tap', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderInfraProps(null);
        GraphRenderer.unhighlightNodes(graph);
      } else {
        if (element.isNode()) { // edge
          _this.renderInfraProps(element);
          GraphRenderer.unhighlightNodes(graph);
          GraphRenderer.highlightNode(element);
        }
        if (element.isEdge()) {
          console.log('taped on edge');
        }
      }
    });
  }

  removeInfraProp() {
    const { infra } = this.state;
    const elementId = this.state.infraElementId;
    const element = InfraQuery.getElementById(infra, elementId);
    const prop = this.state.infraElementProp;
    const graph = ProjectModel.getGraph();
    const { infraGraph } = this.state;

    GraphConnector.updateITComponent(graph, infraGraph, element);
    InfraQuery.removeITProps(element, prop);

    ProjectModel.setInfra(infra);
    ProjectModel.setGraph(graph);
  }

  renderInfraProps(nodeInfra){ // todo: wie bei ITCompliance auf itComponent umstellen
    if (nodeInfra !== null) {
      const { infra } = this.state;
      const id = nodeInfra.data('id');
      const element = InfraQuery.getElementById(infra, id);

      this.setState({ infraElement: element });
      this.setState({ infraElementId: nodeInfra.data('id') });
      this.setState({ infraElementName: nodeInfra.data('display_name') });
      this.setState({ infraElementProps: nodeInfra.data('props') });
    } else {
      this.setState({ infraElement: null });
      this.setState({ infraElementId: null });
      this.setState({ infraElementName: null });
      this.setState({ infraElementProps: null });
    }
  }

  renderInfra(infra) {
    const container = document.getElementById('infra-container');
    const graph = cytoscape({
      container,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            label: 'data(display_name)',
            shape: 'triangle',
            'background-color': '#ffffff',
            'border-style': 'solid',
            'border-color': '#666666',
            'border-width': 1,
          },
        },

        {
          selector: 'edge',
          style: {
            width: 1,
            'line-color': '#1c2966',
            'mid-target-arrow-color': '#3040b7',
            'mid-target-arrow-shape': 'triangle',
            'line-style': 'dotted',
          },
        },
      ],
    });

    GraphCreator.createGraphFromInfra(graph, infra);
    const layout = graph.layout({ name: 'breadthfirst' }); // more options http://js.cytoscape.org/#layouts
    layout.run();
    graph.autolock(false); // elements can not be moved by the user
    GraphRenderer.resizeGraph(graph);

    this.setState({ infra });
    this.setState({ infraGraph: graph }, () => this.hookInfraOnClick(graph));
  }

  renderBpmnProps(element) {
    if (element !== null) {
      const { businessObject } = element;

      this.setState({ bpmnId: businessObject.id });
      this.setState({ bpmnName: businessObject.name });
      this.setState({ isCompliance: ProcessQuery.isCompliance(businessObject) });
      this.setState({ bpmnProps: ProcessQuery.getExtensionOfElement(businessObject) });
    } else {
      this.setState({ bpmnId: null });
      this.setState({ bpmnName: null });
      this.setState({ isCompliance: false });
      this.setState({ bpmnProps: [] });
    }
  }

  renderBpmn = (xml) => {
    this.bpmnModeler.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        this.fitBpmnView();
      }
    });
  };

  renderBpmnPropsPanel() {
    return (
      <div className="property-panel">
        <div>
          <label>ID: {this.state.bpmnId} </label>
        </div>
        <br />
        <div>
          <label>Name: {this.state.bpmnName} </label>
        </div>
        <br />
        <div>
          <ListBox
            options={this.state.bpmnProps}
            onChange={e => this.setState({ bpmnProp: e.value })}
            optionLabel="name"
            style={{ width: '100%' }}
          />
          <br />
          <Button
            className="button-panel"
            label="remove"
            onClick={this.removeBpmnProp}
            tooltip="remove selected property from BPMN element"
          />
        </div>
        <div>
          <Checkbox
            inputId="cb"
            onChange={e => this.setComplianceProcess(e)}
            checked={this.state.isCompliance}
          />
          <label htmlFor="cb">is Compliance Process </label>
        </div>
      </div>
    );
  }

  renderInfraPropsPanel() {
    return (
      <div className="property-panel">
        <div>
          <Button
            className="button-panel p-button-warning"
            label="connect"
            onClick={this.connectElements}
            tooltip="connect selected IT component to selected BPMN element"
          />
        </div>
        <br />
        <div>
          <label>ID: {this.state.infraElementId}</label>
        </div>
        <br />
        <div>
          <label>Name: {this.state.infraElementName}</label>
        </div>
        <br />
        <div>
          <ListBox
            options={this.state.infraElementProps}
            onChange={e => this.setState({ infraElementProp: e.value })}
            optionLabel="name"
            style={{ width: '100%' }}
          />
          <br />
          <Button
            className="button-panel"
            label="remove"
            onClick={this.removeInfraProp}
            tooltip="remove selected property from IT component"
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Growl ref={(el) => { this.growl = el; }} position="topright" />
        <div>
          <section className="container-process">
            <div className="viewer">
              <div id="canvas" />
            </div>
            {this.renderBpmnPropsPanel()}
          </section>
          <section className="container-infra">
            <div className="viewer" id="infra-container" />
            {this.renderInfraPropsPanel()}
          </section>
        </div>
      </div>
    );
  }
}

StepProcIT.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
