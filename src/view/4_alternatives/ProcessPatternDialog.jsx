import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Growl } from 'primereact/growl';
import '../../App.css';

class ProcessPatternDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: 'Create new compliance process pattern',
      mode: 'add',
      patternName: null,
      patternProps: null,
      visibleDialog: false,
      pattern: null,
    };

    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.addCpPattern = this.addCpPattern.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showCpPatternDialog });
    this.setState({ pattern: nextProps.pattern });
  }

  onShow(){
    const { pattern } = this.state;
    if (pattern !== undefined){
      this.setState({ patternName: pattern.name });
      this.setState({ header: 'Edit compliance process pattern' });
      this.setState({ mode: 'edit' });
    }
  }

  onHide() {
    this.setState({ patternName: null });
    this.setState({ visibleDialog: false });
    this.props.close();
  }

  getCpPattern(pattern){
    let cpPattern;

    if (pattern === undefined){
      cpPattern = {
        name: this.state.patternName,
        props: this.state.patternProps,
        modeltype: 'complianceprocesspattern',
        nodetype: 'complianceprocesspattern',
      };
    } else {
      cpPattern = pattern;
      cpPattern.name = this.state.patternName;
    }
    return cpPattern;
  }

  editCpPattern(){
    const cpPattern = this.getCpPattern(this.state.pattern);
    this.props.edit(cpPattern);
  }

  addCpPattern(){
    const cpPattern = this.getCpPattern();
    this.props.addCpProcess(cpPattern);
  }

  buttonClick(){
    const { mode } = this.state;
    const { patternName } = this.state;
    if (patternName !== null && patternName.length !== 0) {
      if (mode === 'add') {
        this.addCpPattern();
      } else if (mode === 'edit') {
        this.editCpPattern();
      }
      this.onHide();
    } else {
      const summary = `Can not ${mode} compliance process pattern.`;
      this.growl.show({
        severity: 'warn',
        summary,
        detail: 'Please specify a name.',
      });
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
            <div>
              <label htmlFor="processName">Name</label>
              <InputText
                id="processName"
                value={this.state.patternName}
                onChange={e => this.setState({ patternName: e.target.value })}
              />
            </div>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default ProcessPatternDialog;
