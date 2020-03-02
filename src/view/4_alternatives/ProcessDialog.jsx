import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Growl } from 'primereact/growl';
import '../../App.css';
import ProjectModel from './../../models/ProjectModel';
import * as GraphQuery from './../../controller/graph/GraphQuery';

class ProcessDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: 'Create new compliance process',
      mode: 'add',
      process: null,
      processName: null,
      processId: null,
      Trigger: [],
      selectedTrigger: null,
      furtherReq: [],
      selectedReq: [],
      complianceProcesses: [],
      selectedCP: null,
      visibleDialog: false,
    };

    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
    this.selectComplianceProcess = this.selectComplianceProcess.bind(this);
    this.renderProps = this.renderProps.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showComplianceProcessDialog });
    this.setState({ process: nextProps.process });
  }

  onHide() {
    this.setState({ process: null });
    this.setState({ processName: null });
    this.setState({ Trigger: [] });
    this.setState({ selectedTrigger: [] });
    this.setState({ furtherReq: [] });
    this.setState({ selectedReq: [] });
    this.setState({ visibleDialog: false });
    this.props.close();
  }

  onShow(){
    this.setState({ Trigger: GraphQuery.getBusinessActivities(ProjectModel.getGraph()) });
    this.setState({ furtherReq: GraphQuery.getInfraElements(ProjectModel.getGraph()) });
    this.setState({ complianceProcesses: GraphQuery.getComplianceProcesses(ProjectModel.getGraph()) });

    const { process } = this.state;
    if (process !== undefined){
      this.setState({ processName: process.name });
      this.setState({ header: 'Edit compliance process' });
      this.setState({ mode: 'edit' });
      this.renderProps(process);
    }
  }

  getProps(){
    const { selectedTrigger } = this.state;
    const req = this.state.selectedReq;
    const result = [];

    result.push({
      key: 'trigger',
      value: selectedTrigger.id,
      display: `Trigger for execution ${selectedTrigger.name}`,
    });

    for (let i = 0; i < req.length; i++){
      result.push({
        key: 'req',
        value: req[i].id,
        display: `Further Requirement ${req[i].name}`,
      });
    }
    return result;
  }

  createComplianceProcess(process){
    let complianceProcess;
    const props = this.getProps();

    if (process === undefined){
      complianceProcess = {
        name: this.state.processName,
        props,
        modeltype: 'complianceprocess',
        nodetype: 'complianceprocess',
      };

      if (this.state.processId !== null) { // take id from cp as 'cpid'
        complianceProcess.cpid = this.state.processId;
      }
    } else {
      complianceProcess = process;
      complianceProcess.name = this.state.processName;
      complianceProcess.props = props;
    }
    return complianceProcess;
  }

  buttonClick(){
    const { selectedTrigger } = this.state;
    const { processName } = this.state;
    const { mode } = this.state;
    if (selectedTrigger !== null && processName !== null && processName.length !== 0) {
      if (mode === 'add') {
        const comProcess = this.createComplianceProcess();
        this.props.addProcess(comProcess);
      } else if (mode === 'edit') {
        const comProcess = this.createComplianceProcess(this.state.process);
        this.props.edit(comProcess);
      }
      this.onHide();
    } else {
      const summary = `Can not ${mode} compliance process.`;
      this.growl.show({
        severity: 'warn',
        summary,
        detail: 'Please specify a name and define a trigger.',
      });
    }
  }

  selectComplianceProcess(cp){ // todo: prüfen, ob bereits in dem Graph vorhanden --> muss unique sein
    this.setState({ processId: cp.id });
    this.setState({ processName: cp.name });
    this.renderProps(cp);
  }

  renderProps(process){
    const trigger = GraphQuery.getBusinessActivities(ProjectModel.getGraph());
    const req = GraphQuery.getInfraElements(ProjectModel.getGraph());
    const { props } = process;
    let selectedTrigger = null;

    for (let i = 0; i < trigger.length; i++){
      for (let j = 0; j < props.length; j++){
        const entity = trigger[i];
        const prop = props[j];
        if (entity.id === prop.value) {
          selectedTrigger = entity;
          break;
        }
      }
    }
    this.setState({ selectedTrigger });

    const selectedReq = [];
    for (let i = 0; i < req.length; i++){
      for (let j = 0; j < props.length; j++){
        const entity = req[i];
        const prop = props[j];
        if (entity.id === prop.value || entity.id === prop._value){
          selectedReq.push(entity);
        }
      }
    }
    this.setState({ selectedReq });
  }

  render() {
    const footer = (
      <div>
        <Button label="Ok" onClick={this.buttonClick} />
        <Button label="Abort" onClick={this.onHide} />
      </div>
    );

    let complianceProcess;
    if (this.state.mode === 'add') {
      complianceProcess = (
        <div>
          <label htmlFor="complianceProcess">Select existing compliance process</label>
          <Dropdown
            style={{ width: '30%' }}
            value={this.state.selectedCP}
            options={this.state.complianceProcesses}
            onChange={(e) => { this.selectComplianceProcess(e.value); }}
            optionLabel="name"
          />
        </div>
      );
    }

    return (
      <div>
        <Growl ref={(el) => { this.growl = el; }} position="topright" />
        <div className="content-section implementation">
          <Dialog
            header={this.state.header}
            footer={footer}
            visible={this.state.visibleDialog}
            style={{ width: '80vw' }}
            onShow={this.onShow}
            onHide={this.onHide}
            closable={false}
          >
            {complianceProcess}
            <div>
              <label htmlFor="processName">Name</label>
              <InputText
                style={{ width: '30%' }}
                id="processName"
                value={this.state.processName}
                onChange={e => this.setState({ processName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="Trigger">Trigger</label>
              <Dropdown
                style={{ width: '30%' }}
                optionLabel="name"
                value={this.state.selectedTrigger}
                options={this.state.Trigger}
                onChange={e => this.setState({ selectedTrigger: e.value })}
              />
            </div>
            <div>
              <label htmlFor="furtherReq">Further Requirements</label>
              <MultiSelect
                style={{ width: '30%' }}
                optionLabel="name"
                value={this.state.selectedReq}
                options={this.state.furtherReq}
                onChange={e => this.setState({ selectedReq: e.value })}
              />
            </div>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default ProcessDialog;
