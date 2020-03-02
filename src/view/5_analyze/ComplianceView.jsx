import React, { Component } from 'react';
import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Growl } from 'primereact/growl';
import RemoveDialog from '../dialog/RemoveDialog';
import ChangeDialog from '../dialog/ChangeDialog';
import '../../App.css';
import ProjectModel from '../../models/ProjectModel';
import * as GraphQuery from '../../controller/graph/GraphQuery';
import * as ComplianceQuery from './../../controller/compliance/ComplianceQuery';
import * as AnalyzeChange from '../../controller/analyze/AnalyzeChange';

class ComplianceView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compliance: [], // whole compliance from ProjectModel
      complianceFilter: [], // compliance elements for ListBox
      complianceText: '', // Text for TextArea
      selectedCompliance: null, // selected element in the listbox
      visibleRemove: false,
      visibleChange: false,
    };

    this.onHide = this.onHide.bind(this);
    this.getChangeGraph = this.getChangeGraph.bind(this);
    this.getRemoveGraph = this.getRemoveGraph.bind(this);
  }

  componentDidMount() {
    this.filterCompliance();
  }

  onHide() {
    this.setState({ visibleRemove: false });
    this.setState({ visibleChange: false });
  }

  getRemoveGraph(){
    const req = this.state.selectedCompliance;

    if (req === null){
      this.growl.show({ severity: 'warn', summary: 'Please select a compliance requirement.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const deleteGraph = AnalyzeChange.getDeleteGraph({ req }, graph);

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

  getChangeGraph(){
    const req = this.state.selectedCompliance;

    if (req === null){
      this.growl.show({ severity: 'warn', summary: 'Please select a compliance requirement.', detail: '' });
    } else {
      const graph = ProjectModel.getGraph();
      const changeGraph = AnalyzeChange.getChangeGraph({ req }, graph);

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

  filterCompliance(){
    const graph = ProjectModel.getGraph();
    const compliance = ProjectModel.getCompliance();
    const complianceNodes = GraphQuery.filterNodes(graph, { type: 'compliance' });
    const complianceFilter = [];

    for (let i = 0; i < complianceNodes.length; i++){
      const id = complianceNodes[i].data('id');
      const req = ComplianceQuery.getRequirementById(compliance.requirement, id);
      complianceFilter.push(req);
    }
    this.setState({ complianceFilter });
  }

  selectCompliance(selectedCompliance){
    const compliance = ProjectModel.getCompliance();
    const { id } = selectedCompliance;
    const reqText = ComplianceQuery.toString(compliance.requirement, id);
    this.setState({ selectedCompliance });
    this.setState({ complianceText: reqText });
  }

  renderComplianceSelector(){
    const option = this.state.complianceFilter;
    const value = this.state.selectedCompliance;

    return (
      <div className="viewer">
        <div>
          <section className="container-compliance">
            <div className="compliance-view-selector">
              <ListBox
                style={{ height: '98%', width: '98%' }}
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

  renderCompliancePropsPanel(){
    return (
      <div className="property-panel">
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
        <RemoveDialog showRemoveDialog={this.state.visibleRemove} close={this.onHide} />
        <ChangeDialog showChangeDialog={this.state.visibleChange} close={this.onHide} />
        <Growl ref={(el) => { this.growl = el; }} position="topright" />
        <div>
          <section className="container-compliance">
            {this.renderComplianceSelector()}
            {this.renderCompliancePropsPanel()}
          </section>
        </div>
      </div>
    );
  }
}

export default ComplianceView;
