import React, { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Growl } from 'primereact/growl';
import { Accordion, AccordionTab } from 'primereact/accordion';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import '../../App.css';
import ProjectModel from '../../models/ProjectModel';
import * as ProcessAdapter from './../../controller/adapt/ProcessAdaptor';
import * as ProcessQuery from './../../controller/process/ProcessQuery';
import * as GraphQuery from './../../controller/graph/GraphQuery';
import * as ProcessRenderer from './../../controller/process/ProcessRenderer';
import * as FileIo from './../../controller/helpers/fileio';
import * as ProjectIo from './../../controller/helpers/projectio';

class CheckBPCDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processList: [],
      selectedProcess: null,
      visibleCheckBPC: false,
      bpmnModeler: null,
      selectedShape: null
    };

    this.selectProcess = this.selectProcess.bind(this);
    this.exportProcess = this.exportProcess.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ visibleCheckBPC: nextProps.showCheckBPC });
  }

  onHide() {
    this.props.close();
    this.setState({ visibleCheckBPC: false });
  }

  onShow() {
    const propsPanel = document.getElementById('alternative-panel-checkBPC');
    const height = propsPanel.offsetHeight;

    if (this.bpmnCheckModeler === undefined) {
      this.bpmnCheckModeler = new BpmnModeler({
        container: '#alternativeBPC',
        height,
      });
    }

    this.renderOriginalProcess(ProjectModel.getBpmnXml());
    this.removeGraph = ProjectModel.getRemoveGraph();
    this.altGraph = ProjectModel.getAltGraph();
    this.renderAlternativeProcesses();
  }

  hookBpmnOnClick(e) {
    const shape = e.element;
    const modeler = this.bpmnCheckModeler;

    let processType;
    if (this.state.selectedProcess === null) {
      processType = 'original process';
    } else {
      processType = this.state.selectedProcess.name;
    }

    if (ProcessQuery.isTaskOrSubprocess(shape)) {
      if (processType === 'original process') {
        this.highlightOriginalProcess();
      }
      ProcessRenderer.highlightShapeOnClick(this.state.bpmnShape, false, modeler);
      ProcessRenderer.highlightShapeOnClick(shape, true, modeler);
      this.renderBpmnProps(shape);
      this.setState({ bpmnShape: shape });
    } else {
      if (processType === 'original process') {
        this.highlightOriginalProcess();
      }
      ProcessRenderer.highlightShapeOnClick(this.state.bpmnShape, false, modeler);
      this.renderBpmnProps(null);
      this.setState({ bpmnShape: null });
    }

    if (e.element !== this.state.selectedShape) {
      this.setState( {selectedShape: e.element}, () => {
        console.log(e.element);
      });
    }
  }

  hookBpmnEventBus() {
    const eventBus = this.bpmnCheckModeler.get('eventBus');
    eventBus.on('element.mouseup', e => this.hookBpmnOnClick(e));
  }

  highlightOriginalProcess() {
    const process = ProcessQuery.getProcess(this.bpmnCheckModeler);
    const flowNodes = ProcessQuery.getFlowNodesOfProcess(process);
    const graph = this.removeGraph;
    const violatedElements = GraphQuery.filterNodes(graph, { style: 'violated' });
    const obsoleteElements = GraphQuery.filterNodes(graph, { style: 'obsolete' });
    const changedElements = GraphQuery.filterNodes(graph, { style: 'changedElement' });

    for (let i = 0; i < flowNodes.length; i++) {
      const node = flowNodes[i];
      for (let j = 0; j < violatedElements.length; j++) {
        const violatedElement = violatedElements[j].data();
        if (node.name !== undefined) {
          if (node.name === violatedElement.display_name){
            const shape = ProcessQuery.getShapeOfRegistry(this.bpmnCheckModeler, node.id);
            const isCompliance = ProcessQuery.isCompliance(node);
            if (isCompliance) {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'red', fill: 'grey' });
            } else {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'red' });
            }
          }
        }
      }

      for (let j = 0; j < obsoleteElements.length; j++) {
        const obsoleteElement = obsoleteElements[j].data();
        if (node.name !== undefined) {
          if (node.name === obsoleteElement.display_name){
            const shape = ProcessQuery.getShapeOfRegistry(this.bpmnCheckModeler, node.id);
            const isCompliance = ProcessQuery.isCompliance(node);
            if (isCompliance) {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'blue', fill: 'grey' });
            } else {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'blue' });
            }
          }
        }
      }

      for (let j = 0; j < changedElements.length; j++) {
        const changedElement = changedElements[j].data();
        if (node.name !== undefined) {
          if (node.name === changedElement.display_name){
            const shape = ProcessQuery.getShapeOfRegistry(this.bpmnCheckModeler, node.id);
            const isCompliance = ProcessQuery.isCompliance(node);
            if (isCompliance) {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'orange', fill: 'grey' });
            } else {
              ProcessRenderer.colorShape(this.bpmnCheckModeler, shape, { stroke: 'orange' });
            }
          }
        }
      }
    }
  }

  pushViolatedToList() {
    const bpmnXml = FileIo.getXmlFromViewer(this.bpmnCheckModeler);
    const entry = {
      name: 'violated process',
      bpmnXml,
    };

    const list = [];
    list.push(entry);
    this.setState({ processList: list });
  }

  renderOriginalProcess = (xml) => {
    this.bpmnCheckModeler.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        const canvas = this.bpmnCheckModeler.get('canvas');
        canvas.zoom('fit-viewport');
        this.hookBpmnEventBus();
        this.highlightOriginalProcess();
        this.pushViolatedToList();
      }
    });
  };

  renderBpmn = (xml) => {
    this.bpmnCheckModeler.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        const canvas = this.bpmnCheckModeler.get('canvas');
        canvas.zoom('fit-viewport'); //--> hier liegt der Fehler??
      }
    });
  };

  selectProcess = (option) => {
    this.setState({ selectedProcess: option });
    this.renderBpmn(option.bpmnXml);
  };

  exportProcess = () => {
    const { bpmnXml } = this.state.selectedProcess;
    const { name } = this.state.selectedProcess;
    ProjectIo.exportBpmn(bpmnXml, name);
  };

  async renderAlternativeProcesses() {
    const { altGraph } = this;
    const { removeGraph } = this;
    const bpmnXml = ProjectModel.getBpmnXml();
    const altProcesses = await ProcessAdapter.getAdaptedProcesses(altGraph, removeGraph, bpmnXml);
    const { processList } = this.state;

    if (altProcesses.length > 0) {
      for (let i = 0; i < altProcesses.length; i++) {
        const altProc = altProcesses[i];
        processList.push(altProc);
      }
      this.setState({ processList });
    } else {
      this.growl.show({
        severity: 'warn',
        summary: 'Can not found alternative compliance processes.',
        detail: 'Check if the compliance process is modelled in the alternative graph.',
      });
    }
  }

  renderBpmnProps(shape) {
    if (shape !== null) {
      const { businessObject } = shape;
      this.setState({ bpmnShape: shape });
      this.setState({ bpmnId: businessObject.id });
      this.setState({ bpmnName: businessObject.name });
      this.setState({ isCompliance: ProcessQuery.isCompliance(businessObject) });
      this.setState({ isCompliancePattern: ProcessQuery.isCompliancePattern(businessObject) });
      this.setState({ bpmnProps: ProcessQuery.getExtensionOfElement(businessObject) });
    } else {
      this.setState({ bpmnShape: null });
      this.setState({ bpmnId: null });
      this.setState({ bpmnName: null });
      this.setState({ isCompliance: false });
      this.setState({ isCompliancePattern: false });
      this.setState({ bpmnProps: [] });
    }
  }

  renderAlternativePanel() {
    return (
        <div className="property-panel" id="alternative-panel-checkBPC">
          <ListBox
            style={{ width: '100%' }}
            value={this.state.selectedProcess}
            options={this.state.processList}
            optionLabel="name"
            onChange={e => this.selectProcess(e.value)}
          />
          <br />
          <Button
            label="export process"
            onClick={this.exportProcess}
          />
        </div>
    );
  }

  renderPropsPanel() {
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
        </div>
        <br />
        <div>
          <Checkbox
              inputId="cbCompliance"
              checked={this.state.isCompliance}
          />
          <label htmlFor="cbCompliance">is Compliance Process </label>
        </div>
        <br />
        <div>
          <Checkbox
              inputId="cbCompliancePattern"
              checked={this.state.isCompliancePattern}
          />
          <label htmlFor="cbCompliancePattern">is Compliance Process Pattern</label>
        </div>
        <br/>
        <div>
          <Accordion>
            <AccordionTab header="Legend">
              <p style={{color:'orange'}}>Changed Element</p>
              <p style={{color:'blue'}}>Obsolete Element</p>
              <p style={{color:'red'}}>Violated Element</p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    );
  }

  // {this.renderPropsPanel()}

  render() {
    return (
        <div>
          <Growl ref={(el) => { this.growl = el; }} position="topright" />
          <div className="content-section implementation">
            <Dialog
              header="Check BPC"
              visible={this.state.visibleCheckBPC}
              style={{ width: '90vw' }}
              onHide={this.onHide}
              onShow={() => this.onShow()}
              maximizable
            >
              <section className="container-process">
                {this.renderAlternativePanel()}
                <div className="viewer" style={{ width: '90vw' }}>
                  <div id="alternativeBPC" />
                </div>

              </section>
            </Dialog>
          </div>
        </div>
    );
  }
}

export default CheckBPCDialog;
