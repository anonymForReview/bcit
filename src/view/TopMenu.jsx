import { Menubar } from 'primereact/menubar';
import React, { Component } from 'react';
import { Growl } from 'primereact/growl';
import PropTypes from 'prop-types';
import 'primeicons/primeicons.css';
import AboutDialog from './dialog/AboutDialog';
import GraphDialog from './dialog/GraphDialog';
import * as ProjectIo from './../controller/helpers/projectio';

export default class TopMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleAbout: false,
      visibleGraph: false,
    };

    this.newProject = this.newProject.bind(this);
    this.openProject = this.openProject.bind(this);
    this.exportProject = this.exportProject.bind(this);
    this.exportBpmn = this.exportBpmn.bind(this);
    this.showAboutDialog = this.showAboutDialog.bind(this);
    this.showGraphDialog = this.showGraphDialog.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  onHide() {
    this.setState({ visibleAbout: false });
    this.setState({ visibleGraph: false });
  }

  showAboutDialog() {
    this.setState({ visibleAbout: true });
  }

  newProject = () => {
    this.onHide();
    // history.pushState({ id: 'homepage' }, 'Home | My App', '/import');
    // location.reload();
    ProjectIo.newProject();
    this.growl.show({
      severity: 'info',
      summary: 'New project created',
      detail: 'New project created. Please go to import (step 1) and import your models.'
    });
  };

  async openProject(){
    const result = await ProjectIo.openProject();

    if (result) {
      this.growl.show({
        severity: 'info',
        summary: 'Project imported'
      });
    } else {
      this.growl.show({
        severity: 'error',
        summary: 'Project can not be imported'
      });
    }
  }

  async exportProject() {
    ProjectIo.exportProject();
  }

  showGraphDialog() {
    this.setState({ visibleGraph: true });
  }

  exportBpmn() {
    const success = ProjectIo.exportBpmn();

    if (!success) {
      this.growl.show({
        severity: 'error',
        summary: 'No process model for export available.',
        details: 'There is no process model available.'
      });
    }
  }

  render() {
    const items = [
      {
        label: 'File',
        items: [
          {
            label: 'New Project',
            icon: 'pi pi-fw pi-file',
            command: () => { this.newProject(); },
          },
          {
            label: 'Open Project',
            icon: 'pi pi-fw pi-folder-open',
            command: () => { this.openProject(); },
          },
          {
            label: 'Export Project',
            icon: 'pi pi-fw pi-save',
            command: () => { this.exportProject(); },
          },
          {
            separator: true,
          },
          {
            label: 'View Graph',
            icon: 'pi pi-fw pi-info',
            command: () => { this.showGraphDialog(); },
          },
          {
            label: 'Export BPMN',
            icon: 'pi pi-fw pi-cloud-download',
            command: () => { this.exportBpmn(); },
          },
        ],
      },
    ];

    return (
      <div>
        <Growl ref={(el) => { this.growl = el; }} position="topright" />
        <AboutDialog showAboutDialog={this.state.visibleAbout} close={this.onHide} />
        <GraphDialog showGraphDialog={this.state.visibleGraph} close={this.onHide} />
        <Menubar model={items}>
          <p className="p-menuitem p-menuitem-link" onClick={this.showAboutDialog}>About BCIT</p>
        </Menubar>
      </div>
    );
  }
}

TopMenu.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
