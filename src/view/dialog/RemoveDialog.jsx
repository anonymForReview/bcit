import React, { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import cytoscape from 'cytoscape';
import '../../App.css';
import AlternativeDialog from './AlternativeDialog';
import ProjectModel from '../../models/ProjectModel';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';

class RemoveDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleDialog: false,
      visibleAlternative: false,
    };
    this.onHide = this.onHide.bind(this);
    this.showAlternativeDialog = this.showAlternativeDialog.bind(this);
    this.closeAlternativeView = this.closeAlternativeView.bind(this);
    this.clickAccordionElement = this.clickAccordionElement.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ visibleDialog: nextProps.showRemoveDialog });
  }

  onHide() {
    this.props.close();
    this.setState({ visibleDialog: false });
  }

  onShow() {
    if (ProjectModel.getRemoveGraph() !== null) {
      this.renderRemoveGraph(ProjectModel.getRemoveGraph());
      this.getAnalyzeResults(ProjectModel.getRemoveGraph().nodes());
    }
  }

  getAnalyzeResults(nodes) {
    const violated = [];
    const obsolete = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.data('nodestyle') === 'violated') {
        violated.push(node.data());
      } else if (node.data('nodestyle') === 'obsolete') {
        obsolete.push(node.data());
      }
    }
    this.setState({ violatedElements: violated });
    this.setState({ obsoleteElements: obsolete });
  }

  closeAlternativeView() {
    this.setState({ visibleAlternative: false });
  }

  hookGraphOnClick(graph){
    const _this = this;

    graph.on('click', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderGraphProps(null);
        GraphRenderer.unhighlightNodes(this.graphRemove);
      } else if (element.isNode()) { // edge
        _this.renderGraphProps({ node: element });
        GraphRenderer.unhighlightNodes(this.graphRemove);
        GraphRenderer.highlightNode(element);
      }
    });
  }

  showAlternativeDialog() {
    this.setState({ visibleAlternative: true });
  }

  clickAccordionElement(element){
    this.renderGraphProps({ el: element });
    GraphRenderer.unhighlightNodes(this.graphRemove);
    const node = this.graphRemove.getElementById(element.id);
    GraphRenderer.highlightNode(node);
  }

  renderRemoveGraph(graph) {
    const containerRemove = document.getElementById('graph-container-remove');
    this.graphRemove = cytoscape({
      container: containerRemove,
      style: [ // the stylesheet for the graph
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

    GraphRenderer.renderAnalyzeGraph(this.graphRemove, graph, containerRemove);
    this.hookGraphOnClick(this.graphRemove);
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
            <AccordionTab header="Violated Compliance Elements">
              <ListBox
                style={{ width: '100%' }}
                options={this.state.violatedElements}
                optionLabel="display_name"
                onChange={e => this.clickAccordionElement(e.value)}
              />
            </AccordionTab>
            <AccordionTab header="Obsolete Compliance Elements">
              <ListBox
                style={{ width: '100%' }}
                options={this.state.obsoleteElements}
                optionLabel="display_name"
                onChange={e => this.clickAccordionElement(e.value)}
              />
            </AccordionTab>
            <AccordionTab header="Legend">
              <p>rectangle - compliance requirement</p>
              <p>roundrectangle - process</p>
              <p>triangle - IT component</p>
              <p>orange border - changed element</p>
              <p>red border - violated element</p>
              <p>blue border - obsolete element</p>
              <p>grey filled - compliance process</p>
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

  renderRemoveDialog() {
    const footer = (
      <div>
        <Button
          label="recommend compliant business process"
          onClick={this.showAlternativeDialog}
          tooltip="recommend compliant business processes by integrating alternative compliance processes"
        />
      </div>
    );

    return (
      <div className="content-section implementation">
        <Dialog
          header="Impacts on Compliance when Removing an Element"
          footer={footer}
          visible={this.state.visibleDialog}
          style={{ width: '90vw' }}
          onHide={this.onHide}
          onShow={() => this.onShow()}
          maximizable
        >
          <section className="container-graph">
            <div className="viewer" id="graph-container-remove" />
            {this.renderGraphPropsPanel()}
          </section>
        </Dialog>
      </div>
    );
  }

  render() {
    return (
      <div>
        <AlternativeDialog
          showAlternative={this.state.visibleAlternative}
          close={this.closeAlternativeView}
        />
        <div>
          {this.renderRemoveDialog()}
        </div>
      </div>
    );
  }
}

export default RemoveDialog;
