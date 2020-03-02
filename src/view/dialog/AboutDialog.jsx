import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import '../../App.css';

class AboutDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleDialog: false,
    };
    this.onHide = this.onHide.bind(this);
  }

  componentWillReceiveProps(nextProps){
    this.setState({ visibleDialog: nextProps.showAboutDialog });
  }

  onHide() {
    this.props.close();
    this.setState({ visibleDialog: false });
  }

  render() {
    const references = (
      <div>
        <p><b>Dependencies</b></p>
        <p>
          <dl>
            <dt>@fortawesome/fontawesome-svg-core</dt>
            <dd>Creators: Fort Awesome</dd>
            <dd>Version: 1.2.15</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/FortAwesome/Font-Awesome</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>@fortawesome/free-solid-svg-icons</dt>
            <dd>Creators: Fort Awesome</dd>
            <dd>Version: 5.7.2</dd>
            <dd>License: (CC-BY-4.0 AND MIT)</dd>
            <dd>Repository: https://github.com/FortAwesome/Font-Awesome</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>@fortawesome/react-fontawesome</dt>
            <dd>Creators: Fort Awesome</dd>
            <dd>Version: 0.1.4</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/FortAwesome/react-fontawesome</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>axios</dt>
            <dd>Creators: Emily Morehouse; Matt Zabriskie; Nick Uraltsev; Rubén Norte</dd>
            <dd>Version: 0.18.0</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/axios/axios</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>bpmn-js</dt>
            <dd>Creators: bpmn.io</dd>
            <dd>Version: 3.2.3</dd>
            <dd>License: under the terms of the bpmn.io license</dd>
            <dd>Repository: https://github.com/bpmn-io/bpmn-js</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>bpmn-moddle</dt>
            <dd>Creators: bpmn.io</dd>
            <dd>Version: 5.1.6</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/bpmn-io/bpmn-moddle</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>classnames</dt>
            <dd>Creators: Jed Watson</dd>
            <dd>Version: 2.2.6</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/JedWatson/classnames</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>cytoscape</dt>
            <dd>Creators: Cytoscape Consortium</dd>
            <dd>Version: 3.5.2</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/cytoscape/cytoscape.js</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>fast-xml-parser</dt>
            <dd>Creators: Natural Intelligence </dd>
            <dd>Version: 3.12.16</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/NaturalIntelligence/fast-xml-parser</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>file-saver</dt>
            <dd>Creators: Eli Grey</dd>
            <dd>Version: 2.0.2</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/eligrey/FileSaver.js</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>file-system</dt>
            <dd>Creators: douzi8</dd>
            <dd>Version: 2.2.2</dd>
            <dd>License: ISC</dd>
            <dd>Repository: https://github.com/douzi8/file-system</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>mini.css</dt>
            <dd>Creators: Angelos Chalaris</dd>
            <dd>Version: 3.0.1</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/Chalarangelo/mini.css</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>moment</dt>
            <dd>Creators: Moment.js</dd>
            <dd>Version: 2.24.0</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/moment/moment</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>primeicons</dt>
            <dd>Creators: PrimeFaces</dd>
            <dd>Version: 1.0.0</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/primefaces/primeicons</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>primereact</dt>
            <dd>Creators: PrimeFaces</dd>
            <dd>Version: 3.1.0</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/primefaces/primereact</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>prop-types</dt>
            <dd>Creators: Facebook</dd>
            <dd>Version: 15.7.2</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/facebook/prop-types</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>react</dt>
            <dd>Creators: Facebook</dd>
            <dd>Version: 16.8.4</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/facebook/react</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>react-dom</dt>
            <dd>Creators: </dd>
            <dd>Version: 16.8.4</dd>
            <dd>License: </dd>
            <dd>Repository: https://github.com/facebook/react/tree/master/packages/react-dom</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>react-hot-loader</dt>
            <dd>Creators: Dan Abramov</dd>
            <dd>Version: 3.1.3</dd>
            <dd>License: </dd>
            <dd>Repository: https://github.com/gaearon/react-hot-loader</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>react-router-dom</dt>
            <dd>Creators: Michael Jackson</dd>
            <dd>Version: 4.3.1</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/ReactTraining/react-router</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>react-transition-group</dt>
            <dd>Version: 2.6.0</dd>
            <dd>License: BSD-3-Clause</dd>
            <dd>Repository: https://github.com/reactjs/react-transition-group</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>read-file</dt>
            <dd>Creators: Jon Schlinkert</dd>
            <dd>Version: 0.2.0</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/jonschlinkert/read-file</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>xml-js</dt>
            <dd>Creators: Yousuf Nashwaan</dd>
            <dd>Version: 1.6.11</dd>
            <dd>License: MIT</dd>
            <dd>Repository: https://github.com/nashwaan/xml-js</dd>
          </dl>
        </p>
        <p><b>Development Dependencies</b></p>
        <p>
          <dl>
            <dt>@neutrinojs/airbnb</dt>
            <dd>Creators: Ed Morley; Eli Perelman; Hassan Ali</dd>
            <dd>Version: 8.3.0</dd>
            <dd>License: MPL-2.0</dd>
            <dd>Repository: https://github.com/mozilla-neutrino/neutrino-dev/tree/master/packages/airbnb</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>@neutrinojs/react</dt>
            <dd>Creators: Ed Morley; Eli Perelman; Hassan Ali</dd>
            <dd>Version: 8.3.0</dd>
            <dd>License: MPL-2.0</dd>
            <dd>Repository: https://github.com/neutrinojs/neutrino/tree/master/packages/react</dd>
          </dl>
        </p>
        <p>
          <dl>
            <dt>neutrino</dt>
            <dd>Creators: Ed Morley; Eli Perelman; Hassan Ali</dd>
            <dd>Version: 8.3.0</dd>
            <dd>License: MPL-2.0</dd>
            <dd>Repository: https://github.com/mozilla-neutrino/neutrino-dev/tree/master/packages/neutrino</dd>
          </dl>
        </p>
      </div>
    );

    return (
      <div className="content-section implementation">
        <Dialog
          header="About BCIT"
          visible={this.state.visibleDialog}
          style={{ width: '50vw' }}
          contentStyle={{ maxHeight: '50vh', overflow: 'auto' }}
          onHide={this.onHide}
          maximizable
        >
          <div>
            <p><b>Contributors:</b></p>
            <br />
            <p>-</p>
            <br />
          </div>
          {references}
        </Dialog>
      </div>
    );
  }
}

export default AboutDialog;
