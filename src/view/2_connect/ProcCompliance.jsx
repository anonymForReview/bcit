import { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Growl } from 'primereact/growl';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import * as ProcessQuery from '../../controller/process/ProcessQuery';
import * as ProcessEditor from '../../controller/process/ProcessEditor';
import * as ProcessRenderer from '../../controller/process/ProcessRenderer';
import * as GraphConnector from '../../controller/graph/GraphConnector';
import * as FileIO from '../../controller/helpers/fileio';
import ProjectModel from '../../models/ProjectModel';
import * as ComplianceQuery from '../../controller/compliance/ComplianceQuery';

export default class StepProcCompliance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bpmnId: null,
      bpmnName: null,
      bpmnProps: [],
      bpmnProp: null,
      bpmnShape: null,
      isCompliance: false,
      compliance: [], // whole compliance from ProjectModel
      complianceFilter: [], // compliance elements for ListBox 1
      complianceText: '', // Text for TextArea
      selectedCompliance: null, // selected element in the listbox
    };

    this.renderBpmnProps = this.renderBpmnProps.bind(this);
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

    const compliance = ProjectModel.getCompliance();
    this.setState({ compliance });
    this.setState({ complianceFilter: compliance });
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
    const compliance = this.state.selectedCompliance;

    if (shape !== null && compliance !== null){
      const viewer = this.bpmnModeler;
      const graph = ProjectModel.getGraph();

      const isUnique = GraphConnector.linkRequirement2Process(viewer, graph, shape, compliance);

      if (isUnique !== false){
        this.renderBpmnProps(shape);
        ProjectModel.setGraph(graph);
        this.fitBpmnView();
        this.updateBpmnXml();

        const detail = `connect ${this.state.bpmnName} and ${this.state.selectedCompliance.id}`;
        this.growl.show({ severity: 'info', summary: 'elements connected', detail });
      } else {
        const detail = `${this.state.bpmnName} and ${this.state.selectedCompliance.id} are already connected`;
        this.growl.show({ severity: 'error', summary: 'elements already connected', detail });
      }
    }
  }

  selectCompliance(selectedRequirement){
    const compliance = this.state.compliance.requirement;
    const { id } = selectedRequirement;
    const reqText = ComplianceQuery.toString(compliance, id);

    this.setState({ complianceText: reqText });
    this.setState({ selectedCompliance: selectedRequirement });
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

  renderComplianceSelector(){
    let option;
    if (this.state.complianceFilter === null) {
      option = [];
    } else {
      option = this.state.complianceFilter.requirement;
    }

    const value = this.state.selectedCompliance;

    return (
      <div className="viewer">
        <div>
          <section className="container-compliance">
            <div className="compliance-view-selector">
              <ListBox
                style={{ height: '98%', width: '98%' }}
                listStyle={{ maxHeight: '300px' }}
                optionLabel="id"
                value={value}
                options={option}
                onChange={e => this.selectCompliance(e.value)}
                filter
              />
            </div>
            <div className="compliance-view-text">
              <InputTextarea
                readOnly
                style={{ width: '100%', height: '98%', resize: 'none' }}
                cols={60}
                value={this.state.complianceText}
                autoResize={false}
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Growl
          ref={(el) => { this.growl = el; }}
          position="topright"
        />
        <div>
          <section className="container-process">
            <div className="viewer">
              <div id="canvas" />
            </div>
            {this.renderBpmnPropsPanel()}
          </section>
          <section className="container-compliance">
            {this.renderComplianceSelector()}
            <div className="property-panel">
              <Button
                className="p-button-warning button-panel"
                label="connect"
                onClick={this.connectElements}
                tooltip="connect selected compliance requirement to selected BPMN element"
              />
            </div>
          </section>
        </div>
      </div>
    );
  }
}
