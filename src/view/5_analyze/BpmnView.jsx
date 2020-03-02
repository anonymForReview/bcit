import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Growl } from 'primereact/growl';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import RemoveDialog from '../dialog/RemoveDialog';
import ChangeDialog from '../dialog/ChangeDialog';
import CheckBPCDialog from '../dialog/CheckBPCDialog';
import ProjectModel from '../../models/ProjectModel';
import * as ProcessQuery from '../../controller/process/ProcessQuery';
import * as AnalyzeChange from '../../controller/analyze/AnalyzeChange';
import * as ProcessRenderer from "../../controller/process/ProcessRenderer";
import * as BPCChecker from "../../controller/analyze/CheckBPC";

class BpmnView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bpmnShape: null,
      bpmnId: null,
      bpmnName: null,
      isCompliance: false,
      visibleRemove: false,
      visibleChange: false,
      visibleCheck: false,
    };

    this.onHide = this.onHide.bind(this);
    this.checkBPC = this.checkBPC.bind(this);
    this.getChangeGraph = this.getChangeGraph.bind(this);
    this.getRemoveGraph = this.getRemoveGraph.bind(this);
    this.showCheckBPCView = this.showCheckBPCView.bind(this);
    this.closeCheckBPCView = this.closeCheckBPCView.bind(this);
  }

  componentDidMount() {
    this.setWith();

    this.bpmnModeler = new BpmnModeler({
      container: '#canvas',
      height: '400px',
    });

    this.hookBpmnEventBus();

    if (ProjectModel.getBpmnXml() !== null) {
      this.renderDiagram(ProjectModel.getBpmnXml());
    }
  }

  onHide() {
    this.setState({ visibleRemove: false });
    this.setState({ visibleChange: false });
  }

  setWith() {
    const bpmnProps = document.getElementById('bpmn-props-panel');
    const bpmnPropsWidth = bpmnProps.offsetWidth;
    const width = this.props.setWidth - bpmnPropsWidth - 50;
    this.setState({ width });
  }

  checkBPC() {
    const graph = ProjectModel.getGraph();
    const violatedGraph = BPCChecker.getViolatedGraph(graph);

    if (violatedGraph !== null && violatedGraph.nodes().length <= 1) {
      const detail = 'no violations found.';
      this.growl.show({ severity: 'info', summary: 'No BPC violation found', detail });
    } else {
      console.log(violatedGraph);
      ProjectModel.setRemoveGraph(violatedGraph);
      this.setState({ visibleCheck: true });
    }
  }

  showCheckBPCView() {
    this.setState({ visibleCheck: true });
  }

  closeCheckBPCView() {
    this.setState({ visibleCheck: false });
  }

  getRemoveGraph() {
    const shape = this.state.bpmnShape;

    if (shape === null){
      this.growl.show({ severity: 'warn', summary: 'Please select an element.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const deleteGraph = AnalyzeChange.getDeleteGraph({ shape }, graph);

      if (!deleteGraph) {
        this.growl.show({
          severity: 'warn',
          summary: 'Can not analyze element',
          detail: 'Can not analyze this element.',
        });
      } else {
        if (deleteGraph !== null && deleteGraph.nodes().length > 1) {
          ProjectModel.setRemoveGraph(deleteGraph);
          this.setState({ visibleRemove: true });
        }
        if (deleteGraph !== null && deleteGraph.nodes().length <= 1) {
          const detail = 'no violations found';
          this.growl.show({ severity: 'info', summary: 'No compliance violation', detail });
        }
      }
    }
  }

  getChangeGraph() {
    const shape = this.state.bpmnShape;

    if (shape === null) {
      this.growl.show({ severity: 'warn', summary: 'Please select an element.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const changeGraph = AnalyzeChange.getChangeGraph({ shape }, graph);

      if (!changeGraph) {
        this.growl.show({
          severity: 'warn',
          summary: 'Can not analyze element',
          detail: 'Can not analyze this element.',
        });
      } else {
        if (changeGraph !== null && changeGraph.nodes().length > 1) {
          ProjectModel.setChangeGraph(changeGraph);
          this.setState({ visibleChange: true });
        }
        if (changeGraph !== null && changeGraph.nodes().length <= 1) {
          const detail = 'no demands found';
          this.growl.show({ severity: 'info', summary: 'No compliance violation', detail });
        }
      }
    }
  }

  hookBpmnOnClick(e) {
    const shape = e.element;
    const modeler = this.bpmnModeler;

    if (ProcessQuery.isTaskOrSubprocess(shape) || ProcessQuery.isExtensionShape(shape)) {
      ProcessRenderer.highlightShapeOnClick(this.state.bpmnShape, false, modeler);
      ProcessRenderer.highlightShapeOnClick(shape, true, modeler);
      this.renderBpmnProps(shape);
      this.setState({ bpmnShape: shape });
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

  renderDiagram = (xml) => {
    this.bpmnModeler.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        const canvas = this.bpmnModeler.get('canvas');
        canvas.zoom('fit-viewport');
      }
    });
  };

  renderBpmnPropsPanel() {
    return (
      <div className="property-panel" id="bpmn-props-panel">
        <div>
          <label>ID: {this.state.bpmnId} </label>
        </div>
        <br />
        <div>
          <label>Name: {this.state.bpmnName} </label>
        </div>
        <br />
        <div>
          <Checkbox
            inputId="cb"
            checked={this.state.isCompliance}
          />
          <label htmlFor="cb">is Compliance Process </label>
        </div>
        <br />
        <Button
          className="button-panel"
          label="check compliance"
          onClick={this.checkBPC}
          tooltip="check business process compliance (BPC)"
        />
        <br />
        <br />
        <Button
          className="button-panel"
          label="show result when remove"
          onClick={this.getRemoveGraph}
          tooltip="show compliance violation when removing these element"
        />
        <br />
        <br />
        <Button
          className="button-panel"
          label="show result when replace"
          onClick={this.getChangeGraph}
          tooltip="show demands by compliance requirements when replacing these element"
        />
      </div>
        /*  add outsourcing elements
            select multiple activities
            this.getOutsourcing Graph
         */

    );
  }

  renderBpmnProps(shape) {
    if (shape !== null) {
      const { businessObject } = shape;
      this.setState({ bpmnShape: shape });
      this.setState({ bpmnId: businessObject.id });
      this.setState({ bpmnName: businessObject.name });
      this.setState({ isCompliance: ProcessQuery.isCompliance(businessObject) });
    } else {
      this.setState({ bpmnShape: null });
      this.setState({ bpmnId: null });
      this.setState({ bpmnName: null });
      this.setState({ isCompliance: false });
    }
  }

  render() {
    return (
      <div>
        <Growl
          ref={(el) => {
          this.growl = el;
        }}
          position="topright"
        />
        <div>
          <CheckBPCDialog
            showCheckBPC={this.state.visibleCheck}
            close={this.closeCheckBPCView}
          />
          <RemoveDialog
            showRemoveDialog={this.state.visibleRemove}
            close={this.onHide}
          />
          <ChangeDialog
            showChangeDialog={this.state.visibleChange}
            close={this.onHide}
          />
          <section className="container-process">
            <div className="viewer" style={{ width: this.state.width }}>
              <div id="canvas" />
            </div>
            {this.renderBpmnPropsPanel()}
          </section>
        </div>
      </div>
    );
  }
}

export default BpmnView;
