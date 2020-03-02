import { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Growl } from 'primereact/growl';
import cytoscape from 'cytoscape';
import './../../App.css';
import ProjectModel from '../../models/ProjectModel';
import * as InfraQuery from '../../controller/infra/InfraQuery';
import * as GraphConnector from '../../controller/graph/GraphConnector';
import * as GraphCreator from '../../controller/graph/GraphEditor';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';
import * as ComplianceQuery from '../../controller/compliance/ComplianceQuery';

export default class StepITCompliance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infra: null,
      infraGraph: null,
      infraElement: null,
      infraElementId: null,
      infraElementName: null,
      infraElementProps: [],
      infraElementProp: null,
      compliance: [], // whole compliance from ProjectModel
      complianceFilter: [], // compliance elements for ListBox 1
      complianceText: '', // Text for TextArea
      selectedCompliance: null, // selected element in the listbox
    };

    this.removeInfraProp = this.removeInfraProp.bind(this);
    this.connectElements = this.connectElements.bind(this);
  }

  componentDidMount() {
    this.onMount();
  }

  onMount(){
    if (ProjectModel.getInfra() !== null) {
      const infra = ProjectModel.getInfra();
      this.setState({ infra }, () => {
        this.renderInfra(infra);
      });
    }

    if (ProjectModel.getCompliance() !== null) {
      const compliance = ProjectModel.getCompliance();
      this.setState({ compliance });
      this.setState({ complianceFilter: compliance });
    }
  }

  connectElements(){
    const itComponent = this.state.infraElement;
    const compliance = this.state.selectedCompliance;

    if (itComponent !== null && compliance !== null) {
      const graph = ProjectModel.getGraph();
      const { infraGraph } = this.state;
      const { infra } = this.state;
      const isUnique = InfraQuery.updateITProps(itComponent, { requirement: compliance });

      if (isUnique){
        GraphConnector.linkRequirement2Infra(graph, infraGraph, compliance, itComponent);
        this.renderInfraProps(itComponent);

        ProjectModel.setGraph(graph);
        ProjectModel.setInfra(infra);

        const detail = `connect ${this.state.infraElementName} and ${this.state.selectedCompliance.id}`;
        this.growl.show({ severity: 'info', summary: 'elements connected', detail });
      } else {
        const detail = `${this.state.infraElementName} and ${this.state.selectedCompliance.id} are already connected`;
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

  hookInfraOnClick(graph){
    const _this = this;
    const { infra } = this.state;

    graph.on('tap', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderInfraProps(null);
        GraphRenderer.unhighlightNodes(graph);
      } else {
        if (element.isNode()) { // edge
          const id = element.data('id');
          const itComponent = InfraQuery.getElementById(infra, id);
          _this.renderInfraProps(itComponent);
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
    GraphCreator.updateITComponentProperty(infraGraph, element);

    InfraQuery.removeITProps(element, prop);
    this.renderInfraProps(element);

    ProjectModel.setInfra(infra);
    ProjectModel.setGraph(graph);
  }

  renderInfraProps(element){
    if (element !== null) {
      this.setState({ infraElement: element });
      this.setState({ infraElementId: element.id });
      this.setState({ infraElementName: element.name });
      this.setState({ infraElementProps: element.props });
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

  renderInfraPropsPanel() {
    return (
      <div className="property-panel">
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

  renderComplianceSelector(){
    const option = this.state.complianceFilter.requirement;
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
        <Growl ref={(el) => { this.growl = el; }} position="topright" />
        <div>
          <section className="container-infra">
            <div className="viewer" id="infra-container" />
            {this.renderInfraPropsPanel()}
          </section>
          <section className="container-compliance">
            {this.renderComplianceSelector()}
            <div className="property-panel">
              <Button
                className="p-button-warning button-panel"
                label="connect"
                onClick={this.connectElements}
                tooltip="connect selected compliance requirement to selected IT component"
              />
            </div>
          </section>
        </div>
      </div>
    );
  }
}
