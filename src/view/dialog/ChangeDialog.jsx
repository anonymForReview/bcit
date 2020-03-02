import React, { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import cytoscape from 'cytoscape';
import '../../App.css';
import ProjectModel from '../../models/ProjectModel';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';

class ChangeDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleDialog: false,
      visibleAlternative: false,
      indirectDemands: [],
      directDemands: [],
    };
    this.onHide = this.onHide.bind(this);
    this.clickAccordionElement = this.clickAccordionElement.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showChangeDialog });
  }

  onHide() {
    this.props.close();
    this.setState({ visibleDialog: false });
  }

  onShow() {
    if (ProjectModel.getChangeGraph() !== null) {
      this.renderChangeGraph(ProjectModel.getChangeGraph());
      this.getDemands(ProjectModel.getChangeGraph().nodes());
    }
  }

  getDemands(nodes) {
    const directDemands = [];
    const indirectDemands = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.data('nodestyle') === 'directdemand') {
        directDemands.push(node.data());
      } else if (node.data('nodestyle') === 'indirectdemand') {
        indirectDemands.push(node.data());
      }
    }
    this.setState({ directDemands });
    this.setState({ indirectDemands });
  }

  hookGraphOnClick(graph){
    const _this = this;

    graph.on('click', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderGraphProps(null);
        GraphRenderer.unhighlightNodes(this.graphChange);
      } else if (element.isNode()) { // edge
        _this.renderGraphProps({ node: element });
        GraphRenderer.unhighlightNodes(this.graphChange);
        GraphRenderer.highlightNode(element);
      }
    });
  }

  renderChangeGraph(graph) {
    const containerChange = document.getElementById('graph-container-change');
    this.graphChange = cytoscape({
      container: containerChange,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'white',
            'border-style': 'solid',
            'border-color': 'black',
            'border-width': 1,
            label: 'data(display_name)',
            'font-size': 10,
            'text-wrap': 'wrap',
            'text-max-width': 20,
            shape: 'rectangle',
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

    GraphRenderer.renderAnalyzeGraph(this.graphChange, graph, containerChange);
    this.hookGraphOnClick(this.graphChange);
  }

  clickAccordionElement(element){
    this.renderGraphProps({ el: element });
    GraphRenderer.unhighlightNodes(this.graphChange);
    const node = this.graphChange.getElementById(element.id);
    GraphRenderer.highlightNode(node);
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
        <br />
        <div>
          <Accordion multiple>
            <AccordionTab header="Direct demands">
              <ListBox
                style={{ width: '100%' }}
                options={this.state.directDemands}
                optionLabel="display_name"
                onChange={e => this.clickAccordionElement(e.value)}
              />
            </AccordionTab>
            <AccordionTab header="Indirect Demands">
              <ListBox
                style={{ width: '100%' }}
                options={this.state.indirectDemands}
                optionLabel="display_name"
                onChange={e => this.clickAccordionElement(e.value)}
              />
            </AccordionTab>
            <AccordionTab header="Legend">
              <p>rectangle - compliance requirement</p>
              <p>roundrectangle - process</p>
              <p>triangle - IT component</p>
              <p>grey filled - compliance process</p>
              <p>orange border - changed element</p>
              <p>green border - demanding element</p>
              <p>solid connection - direct demanding</p>
              <p>dotted connection - indirect demanding</p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    );
  }

  renderGraphProps(input) {
    if (input === null) {
      this.setState({ nodeId: null });
      this.setState({ nodeName: null });
      this.setState({ nodeType: null });
      this.setState({ modelType: null });
      this.setState({ nodeProps: [] });
    } else {
      const { node } = input;
      const { el } = input;

      if (node !== undefined) {
        this.setState({ nodeId: node.data('id') });
        this.setState({ nodeType: node.data('nodetype') });
        this.setState({ modelType: node.data('modeltype') });

        const nodeType = node.data('nodetype');
        if (nodeType !== 'compliance') { // non compliance nodes
          this.setState({ nodeName: node.data('name') });
          this.setState({ nodeProps: node.data('props') });
        } else { // compliance nodes
          this.setState({ nodeName: node.data('title') });
          this.setState({ nodeProps: [] });
        }
      } else if (el !== undefined) {
        this.setState({ nodeId: el.id });
        this.setState({ nodeType: el.nodetype });
        this.setState({ modelType: el.modeltype });

        const nodeType = el.nodetype;
        if (nodeType !== 'compliance') { // non compliance nodes
          this.setState({ nodeName: el.name });
          this.setState({ nodeProps: el.props });
        } else { // compliance nodes
          this.setState({ nodeProps: [] });
          this.setState({ nodeName: el.title });
        }
      }
    }
  }

  renderChangeDialog() {
    return (
      <div className="content-section implementation">
        <Dialog
          header="Demands by Compliance when Replacing an Element"
          visible={this.state.visibleDialog}
          style={{ width: '90vw' }}
          onHide={this.onHide}
          onShow={() => this.onShow()}
          maximizable
        >
          <section className="container-graph">
            <div className="viewer" id="graph-container-change" />
            {this.renderGraphPropsPanel()}
          </section>
        </Dialog>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderChangeDialog()}
      </div>
    );
  }
}

export default ChangeDialog;
