import React, { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../../App.css';
import ProjectModel from '../../models/ProjectModel';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';

class GraphDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: null,
      nodeName: null,
      nodeType: null,
      modelType: null,
      nodeProps: [],
      removeDisabled: true,
      visibleDialog: false,
    };
    this.onHide = this.onHide.bind(this);
    this.onShow = this.onShow.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showGraphDialog });
  }

  onHide() {
    this.props.close();
    this.setState({ visibleDialog: false });
  }

  onShow() {
    console.log('show graph');
    if (ProjectModel.getGraph() !== null) {
      this.renderGraphView();
    }
  }

  hookGraphOnClick(graph){
    const _this = this;

    graph.on('click', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderGraphProps(null);
        GraphRenderer.unhighlightNodes(this.graph);
      } else {
        if (element.isNode()) { // edge
          _this.renderGraphProps(element);
          GraphRenderer.unhighlightNodes(this.graph);
          GraphRenderer.highlightNode(element);
        }
        if (element.isEdge()) {
          console.log('taped on edge');
        }
      }
    });
  }

  removeNode = () => {
    /*
    let graph = ProjectModel.getGraph();
    let node = graph.getElementById(this.state.nodeId);

    if (node !== null) {
      if (node.data('nodetype') === 'compliance'){
        console.log(node);
        GraphEditor.removeNode(node);
        ProjectModel.setGraph(graph);
      }
    }
    */
  };

  renderGraphView(){
    const container = document.getElementById('graph-container');
    this.graph = ProjectModel.getGraph();
    this.graph.mount(container);
    const layout = this.graph.layout({ name: 'breadthfirst' }); // more options http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.reset();
    this.graph.fit();
    this.graph.resize();
    GraphRenderer.styleNodes(this.graph);
    this.hookGraphOnClick(this.graph);
  }

  renderGraphProps(node){
    if (node !== null) {
      this.setState({ nodeId: node.data('id') });
      this.setState({ nodeType: node.data('nodetype') });
      this.setState({ modelType: node.data('modeltype') });

      const nodeType = node.data('nodetype');
      if (nodeType !== 'compliance'){ // non compliance nodes
        this.setState({ nodeName: node.data('name') });
        this.setState({ nodeProps: node.data('props') });
      } else { // compliance nodes
        this.setState({ nodeName: node.data('title') });
        this.setState({ nodeProps: [] });
        this.setState({ removeDisabled: false });
      }
    } else {
      this.setState({ nodeId: null });
      this.setState({ nodeName: null });
      this.setState({ nodeType: null });
      this.setState({ modelType: null });
      this.setState({ nodeProps: [] });
      this.setState({ removeDisabled: true });
    }
  }

  renderGraphPropsPanel() {
    return (
      <div className="property-panel">
        <div>
          <label>ID: {this.state.nodeId}</label>
        </div>
        <br />
        <div>
          <label>Name: {this.state.nodeName}</label>
        </div>
        <br />
        <div>
          <label>Node Type: {this.state.nodeType}</label>
        </div>
        <br />
        <div>
          <label>Model Type: {this.state.modelType}</label>
        </div>
        <br />
        <div>
          <ListBox
            style={{ width: '100%' }}
            options={this.state.nodeProps}
            optionLabel="name"
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="content-section implementation">
        <Dialog
          header="Graph"
          visible={this.state.visibleDialog}
          style={{ width: '80vw' }}
          onHide={this.onHide}
          onShow={this.onShow}
          maximizable
        >
          <section className="container-graph">
            <div className="viewer" id="graph-container" />
            {this.renderGraphPropsPanel()}
          </section>
        </Dialog>
      </div>
    );
  }
}

export default GraphDialog;
