import React, { Component } from 'react';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development';
import BpmnViewer from 'bpmn-js/dist/bpmn-viewer.development';
import * as ProcessQuery from '../../controller/process/ProcessQuery';
import * as ProcessRenderer from './../../controller/process/ProcessRenderer';
import ProjectModel from '../../models/ProjectModel';

export default class Rule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedShape: null,
    };
    this.removeShape = this.removeShape.bind(this);
    this.insertShape = this.insertShape.bind(this);
  }

  componentDidMount(){
    this.bpmnModelerA = new BpmnModeler({
      container: '#canvasa',
      height: '350px',
    });

    this.bpmnModelerB = new BpmnViewer({
      container: '#canvasb',
      height: '350px',
    });

    this.onMount();
    this.hookBpmnEventBus();
  }

  onMount(){
    if (ProjectModel.getBpmnXml() !== null) {
      this.renderBpmnA(ProjectModel.getBpmnXml());
    }

    if (ProjectModel.getBpmnXml() !== null) {
      this.renderBpmnB(ProjectModel.getBpmnXml());
    }
  }

  hookBpmnOnClick(e) {
    const { element } = e;

    if (ProcessQuery.isTaskOrSubprocess(element)) {
      this.renderBpmnProps(element);
      this.setState({ bpmnShape: element });
    } else {
      this.renderBpmnProps(null);
      this.setState({ bpmnShape: null });
    }

    this.renderBpmnProps(element);
    this.setState({ bpmnShape: element });
  }

  hookBpmnEventBus() {
    const eventBus = this.bpmnModelerA.get('eventBus');
    eventBus.on('element.click', e => this.hookBpmnOnClick(e));
  }

  removeShape(){
    if (this.state.selectedShape !== null){
      const viewer = this.bpmnModelerA;
      const shape = this.state.selectedShape;
      const sucs = ProcessQuery.getSucessorShapes(viewer, shape);

      const dataInputShapes = ProcessQuery.getDataInputShapes(viewer, shape);
      for (let i = 0; i < dataInputShapes.length; i++){
        const dataInputShape = dataInputShapes[i];
        ProcessRenderer.removeShape(viewer, dataInputShape);
      }
      ProcessRenderer.removeShape(viewer, shape);

      for (let i = sucs.length - 1; i >= 0; i--){
        ProcessRenderer.moveShape(viewer, sucs[i], 'left');
      }
    }
  }

  insertShape(){
    const shape = this.state.selectedShape;

    if (shape !== null) {
      const viewer = this.bpmnModelerA;
      const posX = shape.x + 300;
      const posY = shape.y * 1.5;
      const sucs = ProcessQuery.getSucessorShapes(viewer, shape);

      for (let i = sucs.length - 1; i >= 0; i--){
        ProcessRenderer.moveShape(viewer, sucs[i]);
      }

      const newShape = ProcessRenderer.createShape(viewer, {
        x: posX, y: posY, type: 'bpmn:Task', name: 'new task',
      });
      ProcessRenderer.integrateShapeSequential(viewer, newShape, shape, 'after');
    }
  }

  renderBpmnProps(shape) {
    if (shape !== null) {
      const { businessObject } = shape;

      this.setState({ bpmnId: businessObject.id });
      this.setState({ bpmnName: businessObject.name });
      this.setState({ selectedShape: shape });
    } else {
      this.setState({ bpmnId: null });
      this.setState({ bpmnName: null });
      this.setState({ selectedShape: null });
    }
  }

  renderBpmnA = (xml) => {
    this.bpmnModelerA.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        const canvas = this.bpmnModelerA.get('canvas');
        canvas.zoom('fit-viewport');
      }
    });
  };

  renderBpmnB = (xml) => {
    this.bpmnModelerB.importXML(xml, (err) => {
      if (err) {
        console.log('error rendering', err);
      } else {
        const canvas = this.bpmnModelerB.get('canvas');
        canvas.zoom('fit-viewport');
      }
    });
  };

  render() {
    return (
      <div>
        <section className="container-process">
          <div className="viewer">
            <div id="canvasa" />
          </div>
          <div className="property-panel">
            <div>
              <label>ID: {this.state.bpmnId} </label>
            </div>
            <br />
            <div>
              <label>Name: {this.state.bpmnName} </label>
            </div>
            <br />
            <Button
              label="remove"
              onClick={this.removeShape}
            />
            <br />
            <br />
            <Button
              label="insert"
              onClick={this.insertShape}
            />
          </div>
        </section>
        <section className="container-process">
          <div className="viewer">
            <div id="canvasb" />
          </div>
        </section>
      </div>
    );
  }
}

Rule.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
