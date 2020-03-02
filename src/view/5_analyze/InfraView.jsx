import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Growl } from 'primereact/growl';
import cytoscape from 'cytoscape';
import RemoveDialog from '../dialog/RemoveDialog';
import ChangeDialog from '../dialog/ChangeDialog';
import '../../App.css';
import * as GraphCreator from '../../controller/graph/GraphEditor';
import * as GraphRenderer from '../../controller/graph/GraphRenderer';
import * as AnalyzeChange from '../../controller/analyze/AnalyzeChange';
import * as InfraQuery from '../../controller/infra/InfraQuery';
import ProjectModel from '../../models/ProjectModel';

class InfraView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infra: null,
      itComponent: null,
      itComponentId: null,
      itComponentName: null,
      width: 0,
      visibleRemove: false,
      visibleChange: false,
    };

    this.onHide = this.onHide.bind(this);
    this.getChangeGraph = this.getChangeGraph.bind(this);
    this.getRemoveGraph = this.getRemoveGraph.bind(this);
  }

  componentDidMount() {
    this.onMount();
  }

  onMount() {
    if (ProjectModel.getInfra() !== null) {
      const infra = ProjectModel.getInfra();
      this.setState({ infra }, () => {
        this.renderInfra(infra);
      });
    }

    this.setWidth();
  }

  onHide() {
    this.setState({ visibleRemove: false });
    this.setState({ visibleChange: false });
    this.setState({ visibleAlternative: false });
  }

  setWidth(){
    const infraProps = document.getElementById('infra-props-panel');
    const infraPropsWidth = infraProps.offsetWidth;
    const width = this.props.setWidth - infraPropsWidth;
    this.setState({ width });
  }

  getRemoveGraph(){
    const { itComponent } = this.state;

    if (itComponent === null){
      this.growl.show({ severity: 'warn', summary: 'Please select an element.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const deleteGraph = AnalyzeChange.getDeleteGraph({ itComponent }, graph);

      if (!deleteGraph) {
        this.growl.show({
          severity: 'warn',
          summary: 'Can not analyze element',
          detail: 'Can not analyze this element.',
        });
      } else {
        if (deleteGraph !== null && deleteGraph.nodes().length > 1) {
          ProjectModel.setRemoveGraph(deleteGraph);
          this.setState({ visibleRemove: true }, () => {
            // this.renderRemoveGraph(deleteGraph);
          },
          );
        }
        if (deleteGraph !== null && deleteGraph.nodes().length <= 1) {
          const detail = 'no violations found';
          this.growl.show({ severity: 'info', summary: 'No compliance violation', detail });
        }
      }
    }
  }

  getChangeGraph() {
    const { itComponent } = this.state;

    if (itComponent === null){
      this.growl.show({ severity: 'warn', summary: 'Please select an element.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const changeGraph = AnalyzeChange.getChangeGraph({ itComponent }, graph);

      if (!changeGraph) {
        this.growl.show({
          severity: 'warn',
          summary: 'Can not analyze element',
          detail: 'Can not analyze this element.',
        });
      } else {
        if (changeGraph !== null && changeGraph.nodes().length > 1) {
          ProjectModel.setChangeGraph(changeGraph);
          this.setState({ visibleChange: true }, () => {
            // this.renderChangeGraph(changeGraph);
          },
          );
        }
        if (changeGraph !== null && changeGraph.nodes().length <= 1) {
          const detail = 'no demands found';
          this.growl.show({ severity: 'info', summary: 'No compliance violation', detail });
        }
      }
    }
  }

  hookInfraOnClick(graph){
    const _this = this;
    const { infra } = this.state;

    graph.on('tap', (evt) => { // http://js.cytoscape.org/#core/events
      const element = evt.target;
      if (element === graph) { // background
        _this.renderInfraProps(null);
        GraphRenderer.unhighlightNodes(this.graph);
      } else if (element.isNode()) {
        const id = element.data('id');
        const itComponent = InfraQuery.getElementById(infra, id);
        _this.renderInfraProps(itComponent);
        GraphRenderer.unhighlightNodes(this.graph);
        GraphRenderer.highlightNode(element);
      }
    });
  }

  renderInfra(infra){
    const container = document.getElementById('infra-container');
    this.graph = cytoscape({
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

    GraphCreator.createGraphFromInfra(this.graph, infra);
    const layout = this.graph.layout({ name: 'breadthfirst' }); // more options http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); // elements can not be moved by the user
    GraphRenderer.resizeGraph(this.graph);
    this.hookInfraOnClick(this.graph);
  }

  renderInfraProps(itComponent){
    if (itComponent !== null) {
      this.setState({ itComponent });
      this.setState({ itComponentId: itComponent.id });
      this.setState({ itComponentName: itComponent.name });
    } else {
      this.setState({ itComponent: null });
      this.setState({ itComponentId: null });
      this.setState({ itComponentName: null });
    }
  }

  renderInfraPropsPanel() {
    return (
      <div className="property-panel" id="infra-props-panel">
        <div>
          <label>ID: {this.state.itComponentId}</label>
        </div>
        <br />
        <div>
          <label>Name: {this.state.itComponentName}</label>
        </div>
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
    );
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
          <RemoveDialog showRemoveDialog={this.state.visibleRemove} close={this.onHide} />
          <ChangeDialog showChangeDialog={this.state.visibleChange} close={this.onHide} />
          <section className="container-infra">
            <div className="viewer" id="infra-container" style={{ width: this.state.width }} />
            {this.renderInfraPropsPanel()}
          </section>
        </div>
      </div>
    );
  }
}

export default InfraView;
