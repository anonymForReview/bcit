import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TabView, TabPanel } from 'primereact/tabview';
import InfraView from './InfraView';
import ComplianceView from './ComplianceView';
import BpmnView from './BpmnView';

export default class Analyze extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabWidth: 0,
    };
  }

  componentDidMount(){
    this.onMount();
  }

  onMount(){
    const tabPanel = document.getElementById('contentSection');
    this.setState({ tabWidth: tabPanel.offsetWidth });
  }

  render() {
    return (
      <div>
        <div className="content-section implementation" id="contentSection">
          <TabView >
            <TabPanel header="View compliance requirements" id="tabPanelCompliance">
              <ComplianceView />
            </TabPanel>
            <TabPanel header="View process model" id="tabPanelBpmn">
              <section className="container-process" id="tab-container">
                <BpmnView setWidth={this.state.tabWidth} />
              </section>
            </TabPanel>
            <TabPanel header="View infrastructure model" id="tabPanelInfra">
              <InfraView setWidth={this.state.tabWidth} />
            </TabPanel>
          </TabView>
        </div>
      </div>
    );
  }
}

Analyze.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
