import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../../App.css';
import * as GraphQuery from '../../controller/graph/GraphQuery';
import ProjectModel from '../../models/ProjectModel';

class ReqDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: 'Add new compliance requirement',
      mode: 'add',
      req: null,
      reqName: null,
      reqNode: null,
      visibleDialog: false,
      untilActivities: null,
      selectedUntilActivity: null,
    };

    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.getReq = this.getReq.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showReqDialog });
    this.setState({ reqNode: nextProps.req });
    this.setState({ reqName: nextProps.reqName });
  }

  onShow(){
    const { reqNode } = this.state;
    /*
    if (reqNode !== undefined){
      this.setState({ header: 'Edit compliance requirement' });
    }
    */
    this.setState({ untilActivities: GraphQuery.getBusinessActivities(ProjectModel.getGraph()) });

    if (reqNode !== undefined){
      this.setState({ reqName: reqNode.id });
      this.setState({ header: 'Edit compliance requirement' });
      this.setState({ mode: 'edit' });
      this.renderProps(reqNode);
    }
  }

  onHide() {
    this.props.close();
    this.setState({ visibleDialog: false });
  }

  getProps(){
    const until = this.state.selectedUntilActivity;
    const result = [];

    if (until !== null) {
      result.push({
        key: 'until',
        value: until.id,
        display: `Until ${until.name}`,
      });
    }
    return result;
  }

  getReq(reqNode){
    const props = this.getProps();
    let req;

    if (reqNode === undefined){
      req = {
        id: this.state.reqName,
        name: this.state.reqName,
        props,
        modeltype: 'compliance',
        nodetype: 'compliance',
      };
    } else {
      req = reqNode;
      req.props = props;
    }
    return req;
  }

  buttonClick(){
    const { mode } = this.state;
    const req = this.getReq(this.state.reqNode);
    if (mode === 'add'){
      this.props.addReq(req);
    } else if (mode === 'edit'){
      this.props.edit(req);
    }
    this.onHide();
  }

  renderProps(req){
    const until = GraphQuery.getBusinessActivities(ProjectModel.getGraph());
    const { props } = req;

    if (props !== undefined || props !== null) {
      for (let i = 0; i < until.length; i++) {
        for (let j = 0; j < props.length; j++) {
          const entity = until[i];
          const prop = props[j];
          if (entity.id === prop.value) {
            this.setState({ selectedUntilActivity: entity });
            break;
          }
        }
      }
    }
  }

  render() {
    const footer = (
      <div>
        <Button label="Ok" onClick={this.buttonClick} />
        <Button label="Abort" onClick={this.onHide} />
      </div>
    );

    return (
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
          <div>
            <label htmlFor="reqName">Name</label>
            <InputText
              id="reqName"
              value={this.state.reqName}
              readonly
            />
          </div>
          <div>
            <label htmlFor="predActivity">Compliance Requirement must be statisfied before</label>
            <Dropdown
              style={{ width: '30%' }}
              optionLabel="name"
              value={this.state.selectedUntilActivity}
              options={this.state.untilActivities}
              onChange={e => this.setState({ selectedUntilActivity: e.value })}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}

export default ReqDialog;
