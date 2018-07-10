/**
 * Project: NASA Path in conjunction with University of Maryland University College
 * @author Group 1 NASA Path team
 * @author Nikki Florea
 */
// March 2018 - Nikki - 
// Modified file to improve visibility of routes
// Added in-line documentation
// April 2018 - George -
// Modified file to include distance total in the results tab in the sidebar from App.java

import React from 'react';
import Renderer from 'components/Renderer/Renderer';
import Controls from 'components/Controls/Controls';
import Sidebar from 'react-sidebar';
import 'react-sticky-header/styles.css';
import StickyHeader from 'react-sticky-header';
import {parseNodesFromStrFile} from 'utils/nodeProcessor/nodeProcessor';
import fetch from 'isomorphic-fetch';

export default class Container extends React.Component {
  constructor() {
    super();
    
    //set route colors
    this.defaultRoutes = [
      // -- set route color values here --
      {value: 1, color: '#ff00cb', nodes: []}, // magenta
      {value: 2, color: '#07d10b', nodes: []}, // green
      {value: 3, color: '#ffb200', nodes: []}, // gold
    ];
    
    // handle state changes
    this.state = {
      stationFile: null,
      handrailFiles: {},
      strFiles: [],
      sidebarOpen: true,
      startHandrail: null,
      endHandrail: null,
      routes: this.defaultRoutes,
      visibleRoutes: [1, 2, 3],
      routesLoaded: false,
      wingspan: 4,
    };
    
    // set handrail values
    this.handrails = [];
    this.handleWingspanChange = this.handleWingspanChange.bind(this);
    this.handleStationFileLoad = this.handleStationFileLoad.bind(this);
    this.handleHandrailFilesLoad = this.handleHandrailFilesLoad.bind(this);
    this.handleStrFilesLoad = this.handleStrFilesLoad.bind(this);
    this.handleSidebarOpen = this.handleSidebarOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStartEndHandrailsChanged = this.handleStartEndHandrailsChanged.bind(this);
    this.handleVisibleRouteChanges = this.handleVisibleRouteChanges.bind(this);
    this.reset = this.reset.bind(this);
  }

  // method to reset form
  reset() {
    this.setState({
      visibleRoutes: [1, 2, 3],
      startHandrail: null,
      endHandrail: null,
      wingspan: 4,
      routes: this.defaultRoutes
    });
  }

  // method to upload a new station model
  handleStationFileLoad(stationFile) {
    this.setState({stationFile});
  }

  // method to upload new handles
  handleHandrailFilesLoad(handrailFiles) {
    this.setState({handrailFiles});
  }

  // method to change wingspan
  handleWingspanChange(wingspan) {
    this.setState({wingspan});
  }

  // mehtod to change route states
  handleVisibleRouteChanges(visibleRoutes) {
    this.setState({visibleRoutes});
  }

  // method to upload new str file
  handleStrFilesLoad(strFiles) {
    strFiles.forEach(file =>
      this.handrails = this.handrails.concat(parseNodesFromStrFile(file))
    );
    this.setState({strFiles});
  }

  //method to toggle sidebar to open state
  handleSidebarOpen(open) {
    this.setState({sidebarOpen: open});
  }

  // method to change start handrail
  handleStartEndHandrailsChanged(startOrEnd, handrail) {
    this.setState({
      [`${startOrEnd}Handrail`]: handrail
    });
  }

  // create a submit handler
  handleSubmit(data) {
    const {routes} = this.state;
    fetch(window.location.protocol + '//' + window.location.hostname + ':8080', {
      method: 'post',
      body: JSON.stringify({
        startHandrail: data.startHandrail ? data.startHandrail.value : null,
        endHandrail: data.endHandrail ? data.endHandrail.value : null,
        nodes: this.handrails, 
        wingspan: data.wingspan.toString()
      })
    })
      .then(resp => resp.json())
      .then(json => {
        const resultRoutes = json.map((route, i) => ({
          ...route,
          ...routes[i],
          nodes: route.nodes,
          distancetotal:route.distancetotal
        }));
        this.setState({
          ...data,
          routes: resultRoutes,
          routesLoaded: true
        });
      })
      .catch(e => console.error(e));
  }

  // render div for sidebar
  render() {
    const {
      stationFile,
      handrailFiles,
      strFiles,
      sidebarOpen,
      startHandrail,
      endHandrail,
      routes,
      visibleRoutes,
      routesLoaded,
      wingspan,
    } = this.state;
    
    // display sidebar div
    return (
      <div className='Container'>
        <StickyHeader
          header={
            <div className='header'>
            <div className="mark"></div>
              <div className='logo'><h1>EVA Navigator</h1></div>
              <div className='sidebar-anchor' onClick={() => this.handleSidebarOpen(!sidebarOpen)}>[Toggle Sidebar]</div>
            </div>
          }
        />
        <Sidebar
          sidebar={
            <div className='sidebar-wrapper'>
              <Controls
                onStationFileLoad={this.handleStationFileLoad}
                onHandrailFilesLoad={this.handleHandrailFilesLoad}
                onStrFilesLoad={this.handleStrFilesLoad}
                onStartEndHandrailsChange={this.handleStartEndHandrailsChanged}
                onSubmit={this.handleSubmit}
                startHandrail={startHandrail}
                endHandrail={endHandrail}
                routes={routes}
                distancetotal={this.distancetotal}
                visibleRoutes={visibleRoutes}
                onRoutesChange={this.handleVisibleRouteChanges}
                onReset={this.reset}
                wingspan={wingspan}
                onWingspanChange={this.handleWingspanChange}
              />
              {routesLoaded &&
                <div>
                  <h1 className='results-header'>Results</h1>
                  <div className='results'>
                  	
                    {routes.map((route, routeI) =>
                      <div key={routeI}>
                        <div>Route {routeI + 1}</div>
                        <div>Total distance: {route.distancetotal} inches</div>
                        <ol>
                          {route.nodes.map((node, nodeI) =>
                            <li key={nodeI}>{node}</li>
                          )}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              }
              <div
                className='sidebar-hide-button'
                onClick={() => this.handleSidebarOpen(false)}
              >
                {'<<<'}
              </div>
            </div>
          }
          open={sidebarOpen}
          onSetOpen={this.handleSidebarOpen}
          styles={{
            sidebar: {
              top: '1em',
              background: 'white',
              overflow: 'hidden',
              minWidth: '20em',
            },
            content: {
              overflow: 'hidden',
            },
            overlay: {
              zIndex: 0,
            }
          }}
        >
          <Renderer
            stationFile={stationFile}
            handrailFiles={handrailFiles}
            strFiles={strFiles}
            startHandrail={startHandrail}
            endHandrail={endHandrail}
            routes={routes.filter(r => visibleRoutes.includes(r.value)).reverse()}
          	wingspan={wingspan}
          />
        </Sidebar>
      </div>
    );
  }
}
