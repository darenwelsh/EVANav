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
// July 2018 - Deepali -
// Modified file to change bullet numbers to dots

import React from 'react';
import Renderer from 'components/Renderer/Renderer';
import Controls from 'components/Controls/Controls';
import Sidebar from 'react-sidebar';
import 'react-sticky-header/styles.css';
import StickyHeader from 'react-sticky-header';
import { parseNodesFromStrFile } from 'utils/nodeProcessor/nodeProcessor';
import fetch from 'isomorphic-fetch';



export default class Container extends React.Component {
  constructor() {
    super();

    //set route colors
    this.defaultRoutes = [
      // -- set route color values here --
      { value: 1, color: '#0000FF', nodes: [] }, // blue			PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/27/2018 Change route 1 color to blue
      { value: 2, color: '#FF8000', nodes: [] }, // orange		PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/27/2018 Change route 2 color to orange
      { value: 3, color: '#8000FF', nodes: [] }, // purple		PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/27/2018 Change route 3 color to purple
    ];

    this.ControlsChild = React.createRef();

    // handle state changes
    this.state = {
      stationFile: null,
      handrailFiles: {},
      strFiles: [],
      sidebarOpen: true,
      startHandrail: null,
      startHandrailSecond: null,
      endHandrail: null,
      endHandrailSecond: null,
      routes: this.defaultRoutes,
      routesSecond: this.defaultRoutes,
      visibleRoutes: [1, 2, 3],
      visibleRoutesSecond: [1, 2, 3],
      wingspan: 4,
      wingspanSecond: 4,
      crewOne: true,
      crewTwo: false
    };

    // set handrail values
    this.handrails = [];
    this.handleWingspanChange = this.handleWingspanChange.bind(this);
    this.handleSecondWingspanChange = this.handleSecondWingspanChange.bind(this);
    this.handleStationFileLoad = this.handleStationFileLoad.bind(this);
    this.handleHandrailFilesLoad = this.handleHandrailFilesLoad.bind(this);
    this.handleStrFilesLoad = this.handleStrFilesLoad.bind(this);
    this.handleInitialStrFilesLoad = this.handleInitialStrFilesLoad.bind(this);
    this.handleSidebarOpen = this.handleSidebarOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSecondSubmit = this.handleSecondSubmit.bind(this);
    this.handleStartEndHandrailsChanged = this.handleStartEndHandrailsChanged.bind(this);
    // this.handleSecondStartEndHandrailsChanged = this.handleSecondStartEndHandrailsChanged.bind(this);
    this.handleVisibleRouteChanges = this.handleVisibleRouteChanges.bind(this);
    this.handleSecondVisibleRouteChanges = this.handleSecondVisibleRouteChanges.bind(this);
    this.switchCrewView = this.switchCrewView.bind(this);
    this.reset = this.reset.bind(this);
  }


  // method to reset form
  reset() {
    this.setState({
      visibleRoutes: [1, 2, 3],
      startHandrail: null,
      endHandrail: null,
      wingspan: 4,
      visibleRoutesSecond: [1, 2, 3],
      startHandrailSecond: null,
      endHandrailSecond: null,
      wingspanSecond: 4,
      routes: this.defaultRoutes,
      routesSecond: this.defaultRoutes,
    });
    this.ControlsChild.current.onResetPathResult();
  }

  switchCrewView(type) {
    //console.log({ type });
    if (type == 'CrewOne') {
      this.setState({ crewOne: true, crewTwo: false });
    }
    if (type == 'CrewTwo') {
      this.setState({ crewOne: false, crewTwo: true });
    }
  }


  // method to upload a new station model
  handleStationFileLoad(stationFile) {
    this.setState({ stationFile });
  }

  // method to upload new handles
  handleHandrailFilesLoad(handrailFiles) {
    this.setState({ handrailFiles });
  }

  // methods to change wingspan
  handleWingspanChange(wingspan) {
    this.setState({ wingspan });
  }

  handleSecondWingspanChange(wingspanSecond) {
    this.setState({ wingspanSecond });
  }

  // methods to change route states
  handleVisibleRouteChanges(visibleRoutes) {
    this.setState({ visibleRoutes });
  }

  handleSecondVisibleRouteChanges(visibleRoutesSecond) {
    this.setState({ visibleRoutesSecond });
  }

  // method to upload new str file
  handleStrFilesLoad(strFiles) {
    strFiles.forEach(file =>
      this.handrails = this.handrails.concat(parseNodesFromStrFile(file))
    );
    this.setState({ strFiles });
  }

  // method to upload ONLY initial str file
  handleInitialStrFilesLoad(strFiles, nodes) {
    this.handrails = this.handrails.concat(nodes);
    this.setState({ strFiles });
  }

  //method to toggle sidebar to open state
  handleSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  /**
   * PHASE 3 MOD
   * @author Lincoln Powell/lpowell25@student.umuc.edu
   * @since 8/9/2018
   * @author Tenadam Weldesemayat/tweldesemayat@student.umuc.edu
   * @since 8/9/2018
   * The handleStartEndHandrailsChanged(string, object, boolean) handler controls when the onChange event is fired
   * to set the start or end handrail dropdown value.  If user clicked on a handrail, create a new handrail object,
   * setting its value to the name of the handrail.  Then set the state of the start or end handrail dropdown.
   * Finally, the Renderer.js componentDidUpdate() function is called, coloring the start or end handrail appropriately.
   */
  handleStartEndHandrailsChanged(startOrEnd, handrail, clickedHandrail = false, crewMemberSelected) {
    //console.log("first");
    if (clickedHandrail) {
      handrail = { value: handrail.name.replace(".stl", "") }
    }
    if (crewMemberSelected === 1) {
      this.setState({
        [`${startOrEnd}Handrail`]: handrail ? handrail.value : null
      });
    }
    if (crewMemberSelected === 2) {
      this.setState({
        [`${startOrEnd}HandrailSecond`]: handrail ? handrail.value : null
      });
    }

  }



  // create a submit handler
  handleSubmit(data) {
    const { routes } = this.state;
    fetch(window.location.protocol + '//' + window.location.hostname + ':8080', {
      method: 'post',
      body: JSON.stringify({
        startHandrail: data.startHandrail ? data.startHandrail : "",				// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Removed .value attribute call from ternary true condition, data.startHandrail; changed ternary false condition, null, to empty string
        endHandrail: data.endHandrail ? data.endHandrail : "",						// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Removed .value attribute call from ternary true condition, data.endHandrail; changed ternary false condition, null, to empty string
        nodes: this.handrails,
        wingspan: data.wingspan.toString()
        //commenting out because RouteRequest doesnt have this property therefore deserialization will fail later
        //previousRoutes: this.state.routes //passing previous routes
      })
    })
      .then(resp => resp.json())
      .then(json => {
        const resultRoutes = json.map((route, i) => ({
          ...route,
          ...routes[i],
          nodes: route.nodes,
          distancetotal: route.distancetotal
        }));
        this.setState({
          ...data,
          routes: resultRoutes
        });
        this.ControlsChild.current.onCrewOnePathLoaded(resultRoutes, true);
      })
      .catch(e => console.error(e));
  }

  // create a submit handler for crew member 2
  handleSecondSubmit(data) {
    //debugger;
    const { routesSecond } = this.state;
    fetch(window.location.protocol + '//' + window.location.hostname + ':8080', {
      method: 'post',
      body: JSON.stringify({
        startHandrail: data.startHandrailSecond ? data.startHandrailSecond : "",
        endHandrail: data.endHandrailSecond ? data.endHandrailSecond : "",
        nodes: this.handrails,
        wingspan: data.wingspanSecond.toString()
        //commenting out because RouteRequest doesnt have this property therefore deserialization will fail later
        //previousRoutes: this.state.routesSecond //passing previous routes
      })
    })
      .then(resp => resp.json())
      .then(json => {
        const resultRoutes = json.map((route, i) => ({
          ...route,
          ...routesSecond[i],
          nodes: route.nodes,
          distancetotal: route.distancetotal
        }));
        this.setState({
          ...data,
          routesSecond: resultRoutes,
        });
        this.ControlsChild.current.onCrewTwoPathLoaded(resultRoutes, true);
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
      startHandrailSecond,
      endHandrailSecond,
      routes,
      routesSecond,
      visibleRoutes,
      visibleRoutesSecond,
      wingspan,
      wingspanSecond,
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
                ref = {this.ControlsChild}
                onStationFileLoad={this.handleStationFileLoad}
                onHandrailFilesLoad={this.handleHandrailFilesLoad}
                onStrFilesLoad={this.handleStrFilesLoad}
                onInitialStrFilesLoad={this.handleInitialStrFilesLoad}
                onStartEndHandrailsChange={this.handleStartEndHandrailsChanged}
                // onSecondStartEndHandrailsChange={this.handleSecondStartEndHandrailsChanged}
                onSubmit={this.handleSubmit}
                onSecondSumbit={this.handleSecondSubmit}
                startHandrail={startHandrail}
                startHandrailSecond={startHandrailSecond}
                endHandrail={endHandrail}
                endHandrailSecond={endHandrailSecond}
                routes={routes}
                routesSecond={routesSecond}
                distancetotal={this.distancetotal}
                visibleRoutes={visibleRoutes}
                visibleRoutesSecond={visibleRoutesSecond}
                onRoutesChange={this.handleVisibleRouteChanges}
                onSecondRoutesChange={this.handleSecondVisibleRouteChanges}
                onReset={this.reset}
                wingspan={wingspan}
                wingspanSecond={wingspanSecond}
                onWingspanChange={this.handleWingspanChange}
                onSecondWingspanChange={this.handleSecondWingspanChange}
                onCrewTabChange={this.switchCrewView}
              />
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
            startHandrailSecond={startHandrailSecond}
            endHandrail={endHandrail}
            endHandrailSecond={endHandrailSecond}
            crewMemberSelected={this.state.crewOne ? 1 : 2}
            routes={routes.filter(r => visibleRoutes.includes(r.value)).reverse()}
            routesSecond={routesSecond.filter(r => visibleRoutesSecond.includes(r.value)).reverse()}
            wingspan={wingspan}
            wingspanSecond={wingspanSecond}

            // PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/9/2018
            // Add handleStartEndHandrailsChanged to Renderer.js as property
            handleStartEndHandrailsChanged={this.handleStartEndHandrailsChanged}

          />
        </Sidebar>
      </div>
    );
  }
}