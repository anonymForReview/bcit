import React, { Component } from 'react';
import { Growl } from 'primereact/growl';
import PropTypes from 'prop-types';
import ReqDialog from './ReqDialog';
import ProjectModel from '../../models/ProjectModel';
import GraphEditPanel from './GraphEditPanel';
import GraphPropsPanel from './GraphPropsPanel';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';
import * as GraphEditor from '../../controller/graph/GraphEditor';
import * as GraphQuery from '../../controller/graph/GraphQuery';

export default class Alternatives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: null,
      nodeName: null,
      nodeType: null,
      modelType: null,
      nodeProps: [],
      visibleReqDialog: false,
      reqName: null,
    };

    this.onHide = this.onHide.bind(this);
    this.showReqDialog = this.showReqDialog.bind(this);
    this.addReq = this.addReq.bind(this);
    this.addProcess = this.addProcess.bind(this);
    this.addComplianceProcessPattern = this.addComplianceProcessPattern.bind(this);
    this.editNode = this.editNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
  }

  componentDidMount(){
    this.onMount();
  }

  componentWillUnmount(){
    ProjectModel.setAltGraph(this.graph);
  }

  onMount(){
    const container = document.getElementById('alt-graph-container');
    this.graph = ProjectModel.getAltGraph();

    if (this.graph === null){
      this.graph = GraphEditor.getEmptyGraph();
    }

    this.graph.mount(container);
    GraphRenderer.resizeGraph(this.graph);
    GraphRenderer.styleNodesAltGraph(this.graph);
    GraphRenderer.drawNodesAltGraph(this.graph);
    this.hookGraphOnClick(this.graph);
  }

  onHide() {
    this.setState({ visibleComplianceProcessDialog: false });
    this.setState({ visibleComplianceProcessPatternDialog: false });
    this.setState({ visibleReqDialog: false });
  }

  hookGraphOnClick(graph){
    const _this = this;

    graph.on('click', (evt) => {
      const element = evt.target;
      if (element === graph) { // background
        _this.renderGraphProps(null);
        GraphRenderer.unhighlightNodes(this.graph);
      } else if (element.isNode()) { // edge
        _this.renderGraphProps(element);
        GraphRenderer.unhighlightNodes(this.graph);
        GraphRenderer.highlightNode(element);
      }
    });
  }

  linkNodes = (graph, node, newNode) => {
    GraphEditor.linkNodesAltGraph(graph, node, newNode);
    GraphRenderer.styleNodesAltGraph(graph);
    GraphRenderer.drawNodesAltGraph(graph);
  };

  showReqDialog(req){
    if (req !== null){
      const isUnique = GraphQuery.isUniqueNode(this.graph, { id: req.id });
      if (isUnique) {
        this.setState({ visibleReqDialog: true });
        this.setState({ reqName: req.id });
      } else {
        this.growl.show({ // *** go to tab ****
          severity: 'warn',
          summary: 'Compliance requirement already in the graph.',
          detail: '',
        });
      }
    } else {
      this.growl.show({
        severity: 'warn',
        summary: 'Please select an compliance requirement from the list.',
        detail: '',
      });
    }
  }

  addReq(req){ // **** add a new Tab and display graph
    GraphEditor.addNode(this.graph, { req });
    GraphRenderer.styleNodesAltGraph(this.graph);
    GraphRenderer.drawNodesAltGraph(this.graph);
  }

  addProcess(cp){
    const newNode = GraphEditor.addNode(this.graph, { complianceProcess: cp });
    const node = this.graph.getElementById(this.state.nodeId);
    this.linkNodes(this.graph, node, newNode);
  }

  addComplianceProcessPattern(cpPattern) {
    const newNode = GraphEditor.addNode(this.graph, { comProcessPattern: cpPattern });
    const node = this.graph.getElementById(this.state.nodeId);
    this.linkNodes(this.graph, node, newNode);
  }

  editNode(changedNode){
    const { id } = changedNode;
    const node = this.graph.getElementById(id);
    node.data('name', changedNode.name);
    node.data('display_name', changedNode.name);
    node.data('props', changedNode.props);
    this.renderGraphProps(node);
    GraphRenderer.styleNodesAltGraph(this.graph);
    GraphRenderer.drawNodesAltGraph(this.graph);
  }

  removeNode(nodeId) { // **** if compliance req. remove tab
    const node = this.graph.getElementById(nodeId);

    if (node !== null && nodeId !== null){
      // connect predecessors with successor
      const preds = GraphQuery.getPredecessors(node);
      const suc = GraphQuery.getSuccessors(node)[0];
      GraphEditor.removeNode(node);

      if (preds.length > 0) {
        for (let i = 0; i < preds.length; i++) {
          const pred = preds[i];
          GraphEditor.linkNodes(this.graph, pred, suc);
        }
      }
      this.renderGraphProps(null);
    } else {
      this.growl.show({
        severity: 'warn',
        summary: 'Please select a node from the graph.',
        detail: '',
      });
    }
  }

  editSuccessor(node, newSucId){
    const oldSuc = GraphQuery.getDirectSuccessor(node)[0];
    const oldEdge = GraphQuery.getEdge(node, oldSuc);
    oldEdge.remove();
    const newSuc = this.graph.getElementById(newSucId);
    GraphEditor.linkNodes(this.graph, node, newSuc);
  }

  renderGraphProps(node){
    if (node !== null) {
      this.setState({ nodeId: node.data('id') });
      this.setState({ nodeName: node.data('name') });
      this.setState({ nodeType: node.data('nodetype') });
      this.setState({ modelType: node.data('modeltype') });
      this.setState({ nodeProps: node.data('props') });
    } else {
      this.setState({ nodeId: null });
      this.setState({ nodeName: null });
      this.setState({ nodeType: null });
      this.setState({ modelType: null });
      this.setState({ nodeProps: [] });
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
        <ReqDialog
          showReqDialog={this.state.visibleReqDialog}
          reqName={this.state.reqName}
          addReq={this.addReq}
          close={this.onHide}
        />
        <div>
          <section className="container-graph">
            <GraphEditPanel
              nodeType={this.state.nodeType}
              showReqDialog={this.showReqDialog}
              addProcess={this.addProcess}
              addCpPattern={this.addComplianceProcessPattern}
            />
            <div className="viewer" id="alt-graph-container" />
            <GraphPropsPanel
              nodeId={this.state.nodeId}
              nodeName={this.state.nodeName}
              nodeType={this.state.nodeType}
              modelType={this.state.modelType}
              nodeProps={this.state.nodeProps}
              editNode={this.editNode}
              removeNode={this.removeNode}
            />
          </section>
        </div>
      </div>
    );
  }
}

Alternatives.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
