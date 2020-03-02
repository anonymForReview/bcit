import cytoscape from 'cytoscape';
import { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.css';
import 'mini.css';
import './App.css';
import TopMenu from './view/TopMenu';
import ConnectWizard from './view/Wizard';
import ProjectModel from './models/ProjectModel';

export default class App extends Component {
  constructor(props){
    super(props);

    let graph = ProjectModel.getGraph();
    if (graph === null) {
      graph = cytoscape({
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'background-color': '#ffffff',
              'border-style': 'solid',
              'border-color': '#666',
              'border-width': 1,
              label: 'data(id)',
              'font-size': 10,
              'text-wrap': 'wrap',
              'text-max-width': 20,
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
      ProjectModel.setGraph(graph);
    }
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <TopMenu />
            <div className="container content">
              <Route path="/" component={ConnectWizard} />
            </div>
          </div>
        </Router>
      </div>
    );
  }
}
