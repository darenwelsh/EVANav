import React from 'react';
import Dropzone from 'react-dropzone';
import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Checkbox, CheckboxGroup} from 'react-checkbox-group';
import { parseNodesFromStrFile } from 'utils/nodeProcessor/nodeProcessor';


export default class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.defaultRoutes = props.routes;
    this.state = {
      stationFile: null,
      stationError: '',
      stationLoading: false,
      handrailFiles: [],
      handrailError: '',
      handrailLoading: false,
      strFiles: [],
      crewOneRoutes: [],
      crewTwoRoutes: [],
      canShowResult: false
    };
    this.handleStationFileDrop = this.handleStationFileDrop.bind(this);
    this.handleStationFileRejected = this.handleStationFileRejected.bind(this);
    this.handleHandrailFilesDrop = this.handleHandrailFilesDrop.bind(this);
    this.handleStrFilesDrop = this.handleStrFilesDrop.bind(this);
    this.createHandrailOptions = this.createHandrailOptions.bind(this);
    this.submit = this.submit.bind(this);
    this.secondSubmit = this.secondSubmit.bind(this);
    this.changeSelectedTabIndex = this.changeSelectedTabIndex.bind(this);
    this.demoHandrailFiles = [];
    this.nodes = [];
  }
  
  onCrewOnePathLoaded(routes1, showResult){
    this.setState({
      crewOneRoutes: routes1,
      canShowResult: showResult
    });
  }

  onCrewTwoPathLoaded(routes2, showResult){
    this.setState({
      crewTwoRoutes: routes2,
      canShowResult: showResult
    });
  }

  onResetPathResult(){
    this.setState({
      crewOneRoutes: [],
      crewTwoRoutes: [],
      canShowResult: false
    });
  }

  componentDidMount() {
    const {onStationFileLoad, onHandrailFilesLoad, onInitialStrFilesLoad} = this.props;
    const fileName = './models/Handrails/stage_55-6_v12_nohandles_binary.stl';
    const handrailDataFiles = {};
    const handrailFiles = [];
    const strFiles = [];

    // load a default stationFile for demo purposes
    this.setState({
      stationFile: {
        name: fileName,
        size: 178422000
      },
      stationLoading: true,
      handrailLoading: false,
    });
    
    fetch(fileName)
      .then(response => response.arrayBuffer())
      .then(data => {
        onStationFileLoad(data);
        this.setState({stationLoading: false, });
      }); 
 
    fetch('./models/Handrails/Entire_ISS.str')
    .then(response => response.text())
    .then(data => { 
      strFiles.push(data); 
      
      strFiles.forEach(strData =>{
        this.nodes = this.nodes.concat(parseNodesFromStrFile(strData));        
      }); 

      this.nodes.forEach(node => {
        this.demoHandrailFiles.push(node.geometry_file_name);
      });

      this.demoHandrailFiles.forEach(handrailFile => {
        fetch(`./models/Handrails/frames/${handrailFile}`)
          .then(response => response.arrayBuffer())
          .then(data => {
            handrailDataFiles[handrailFile] = data;
            handrailFiles.push({name: handrailFile});
            if (Object.keys(handrailDataFiles).length == this.demoHandrailFiles.length) {
              onHandrailFilesLoad(handrailDataFiles);
              this.setState({
                handrailLoading: false,
                handrailFiles,
              });
            }
          });
      });

      onInitialStrFilesLoad(strFiles, this.nodes);
    });
  }

  handleStationFileDrop(acceptedFiles) {
    const {
      onStationFileLoad
    } = this.props;
    acceptedFiles.forEach(stationFile => {
      this.setState({stationError: ''});
      const reader = new FileReader();
      reader.onabort = () => console.warn('stationFile reading was aborted');
      reader.onerror = () => console.warn('stationFile reading has failed');
      reader.onloadstart = () => this.setState({stationLoading: true});
      reader.onloadend = () => {
        onStationFileLoad(reader.result);
        this.setState({
          stationFile,
          stationLoading: false
        });
      };

      reader.readAsBinaryString(stationFile);
    });
  }

  handleStationFileRejected() {
    this.setState({stationError: 'Can only accept stl files'});
  }

  handleHandrailFilesDrop(files) {
    const {onHandrailFilesLoad} = this.props;
    const {handrailLoading, handrailFiles} = this.state;
    const handrailResults = {};
    files.forEach((handrailFile, i) => {
      this.setState({handrailError: ''});
      const reader = new FileReader();
      reader.onabort = () => console.warn('handrailFile reading was aborted');
      reader.onerror = () => console.warn('handrailFile reading has failed');
      reader.onloadstart = () => {
        if (!handrailLoading) {
          this.setState({handrailLoading: true});
        }
      };
      reader.onloadend = () => {
        handrailFiles.push(handrailFile);
        handrailResults[handrailFile.name] = reader.result;
        if (i === files.length - 1) {
          this.setState({
            handrailFiles,
            handrailLoading: false
          });
          onHandrailFilesLoad(handrailResults);
        }
      };

      reader.readAsBinaryString(handrailFile);
    });
  }

  handleStrFilesDrop(files) {
    const {onStrFilesLoad} = this.props;
    const strResults = [];
    files.forEach((handrailFile, i) => {
      const reader = new FileReader();
      reader.onabort = () => console.warn('handrailFile reading was aborted');
      reader.onerror = () => console.warn('handrailFile reading has failed');
      reader.onloadend = () => {
        strResults.push(reader.result);
        if (i === files.length - 1) {
          this.setState({
            strFiles: files,
          });
          onStrFilesLoad(strResults);
        }
      };

      reader.readAsBinaryString(handrailFile);
    });
  }

  changeSelectedTabIndex(tab)  {
   
   this.props.onCrewTabChange(tab);
  }

  createHandrailOptions() {
    return this.state.handrailFiles.map(file => ({
      value: file.name.replace(/\.stl$/, ''),
      label: file.name.replace(/\.stl$/, '')      
    }));
  }

  submit() {
    const {
      startHandrail,
      endHandrail,
      wingspan,
    } = this.props;
    this.props.onSubmit({
      startHandrail,
      endHandrail,
      wingspan,
    });
  }

  secondSubmit() {
    //debugger;
    const {
      startHandrailSecond,
      endHandrailSecond,
      wingspanSecond,
    } = this.props;
    this.props.onSecondSumbit({
      startHandrailSecond,
      endHandrailSecond,
      wingspanSecond,
    });
  }

  render() {
    const {
      stationFile,
      stationError,
      stationLoading,
      handrailFiles,
      handrailError,
      handrailLoading,
      strFiles,
      crewOneRoutes,
      crewTwoRoutes,
      canShowResult
    } = this.state;
    const {
      startHandrail,
      endHandrail,
      startHandrailSecond,
      endHandrailSecond,
      onStartEndHandrailsChange,
      //onSecondStartEndHandrailsChange,
      onRoutesChange,
      onSecondRoutesChange,
      onReset,
      wingspan,
      wingspanSecond,
      visibleRoutes,
      visibleRoutesSecond,
      onWingspanChange,
      onSecondWingspanChange,
      } = this.props;
    return (
      <div className='Controls'>
        <Tabs>
          <TabList>
            <Tab>Controls</Tab>
            <Tab>Upload Files</Tab>
            <Tab>Path Results</Tab>
          </TabList>
          <TabPanel>
            <Tabs forceRenderTabPanel>
              <TabList>
             <Tab onClick={this.changeSelectedTabIndex.bind(this,'CrewOne')} >Crew Member 1</Tab>
             <Tab onClick={this.changeSelectedTabIndex.bind(this, 'CrewTwo')} >Crew Member 2</Tab> 
              </TabList>
                <TabPanel>
                  <div className='handrails-selector'>
                    <Select
                      name='startHandrail'
                      placeholder='Select start handrail...'
                      value={startHandrail}
                      options={this.createHandrailOptions()}
                      onChange={option => onStartEndHandrailsChange('start', option, false, 1)}
                    />
                    <Select
                      name='endHandrail'
                      placeholder='Select end handrail...'
                      value={endHandrail}
                      options={this.createHandrailOptions()}
                      onChange={option => onStartEndHandrailsChange('end', option, false, 1)}
                    />
                  </div>
                  <div className='wingspan-control'>
                    Wingspan: {wingspan} ft
                    <Slider value={wingspan}
                      onChange={onWingspanChange}
                      min={4}
                      max={7}
                      marks={{
                        4: '4 ft',
                        5: '5 ft',
                        6: '6 ft',
                        7: '7 ft'
                      }}
                    />
                  <br />
                  </div>
                <div className='route-select-control'>
                    <strong>Visible Paths</strong>
                    <CheckboxGroup className='route-select-container' name="routes" value={visibleRoutes} onChange={onRoutesChange}>
                      {this.defaultRoutes.map(route => (
                        <label style={{borderBottom: `${route.color} 5px solid`}} key={route.value}>
                          <Checkbox value={route.value} />
                          Route {route.value}
                        </label>
                      ))}
                    </CheckboxGroup>
                  </div>
                  <div className='action-control'>
                    <button className='button-primary' onClick={this.submit}>Go</button>
                    <button className='button-primary' onClick={onReset}>Reset</button>
                  </div>
                <br /><br /><br /><br /><br /><br />
								<div className='legend-title'> <b>How to Maneuver ISS</b> </div>
								<div className=' legend-key1'> <b>Rotate ISS:</b> Hold left mouse button </div>
								<div className=' legend-key2'> <b>Pan ISS:</b> Hold right mouse button </div>
								<div className=' legend-key3'> <b>Mouse wheel:</b> Zoom ISS in/out </div>
                </TabPanel>
                <TabPanel>
                  <div className='handrails-selector'>
                    <Select
                      name='startHandrail'
                      placeholder='Select start handrail...'
                      value={startHandrailSecond}
                      options={this.createHandrailOptions()}
                      onChange={option => onStartEndHandrailsChange('start', option, false, 2)}
                    />
                    <Select
                      name='endHandrail'
                      placeholder='Select end handrail...'
                      value={endHandrailSecond}
                      options={this.createHandrailOptions()}
                      onChange={option => onStartEndHandrailsChange('end', option, false, 2)}
                    />
                  </div>
                  <div className='wingspan-control'>
                    Wingspan: {wingspanSecond} ft
                    <Slider value={wingspanSecond}
                      onChange={onSecondWingspanChange}
                      min={4}
                      max={7}
                      marks={{
                        4: '4 ft',
                        5: '5 ft',
                        6: '6 ft',
                        7: '7 ft'
                      }}
                    />
                  <br />
                  </div>
                <div className='route-select-control'>
                    <strong>Visible Paths</strong>
                    <CheckboxGroup className='route-select-container' name="routes" value={visibleRoutesSecond} onChange={onSecondRoutesChange}>
                      {this.defaultRoutes.map(route => (
                        <label style={{borderBottom: `${route.color} 5px solid`}} key={route.value}>
                          <Checkbox value={route.value} />
                          Route {route.value}
                        </label>
                      ))}
                    </CheckboxGroup>
                  </div>
                  <div className='action-control'>
                    <button className='button-primary' onClick={this.secondSubmit}>Go</button>
                    <button className='button-primary' onClick={onReset}>Reset</button>
                  </div>
               <br /><br /><br /><br /><br /><br />
								<div className='legend-title'> <b>How to Maneuver ISS</b> </div>
								<div className=' legend-key1'> <b>Rotate ISS:</b> Hold left mouse button </div>
								<div className=' legend-key2'> <b>Pan ISS:</b> Hold right mouse button </div>
								<div className=' legend-key3'> <b>Mouse wheel:</b> Zoom ISS in/out </div>
                </TabPanel>
            </Tabs>
          </TabPanel> 
          <TabPanel>
            <div className='file-controls'>
              <div className='station-controls'>
                <p>Drag & drop or click to upload <br /> the station stl file to render...</p>
                {stationLoading && <div style={{color: 'blue'}}>Station model is loading, this might take a while...</div>}
                <Dropzone
                  className="drop-upload"
                  onDrop={this.handleStationFileDrop}
                  multiple={false}
                  onDropRejected={this.handleStationFileRejected}
                  accept='.stl'
                >
                  <div style={{color: 'red'}}>{stationError}</div>
                  {stationFile &&
                    <div>{stationFile.name} - {stationFile.size} bytes</div>
                  }
                </Dropzone>
              </div>
              <div className='handrails-controls'>
                <p>Drag & drop or click to upload <br /> the handrail stl files to render...</p>
                {handrailLoading && <div style={{color: 'blue'}}>Handrail models are loading, this might take a while...</div>}
                <Dropzone
                  className="drop-upload"
                  onDrop={this.handleHandrailFilesDrop}
                  onDropRejected={this.handleHandrailFilesRejected}
                  accept='.stl'
                >
                  <div style={{color: 'red'}}>{handrailError}</div>
                  {handrailFiles.length > 0 &&
                    <div>{handrailFiles.length} handrails loaded</div>
                  }
                </Dropzone>
              </div>
              <div className='str-controls'>
                <p>Drag & drop or click to upload <br /> one or more str files to position the handrails...</p>
                <Dropzone
                  className="drop-upload"
                  onDrop={this.handleStrFilesDrop}
                  accept='.str'
                >
                  {strFiles.map(strFile =>
                    <div key={strFile.name}>{strFile.name}</div>
                  )}
                </Dropzone>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
          {canShowResult &&
          <div>
            <h1 className='results-header'>Route Results</h1>
            <div className='results'>
              <table> 
                <tbody>
                  <tr>
                    <td className='td-crew1-results'>
                      <div className='crew1-results'>
                        <h3 className='crew1-results-header'>1. Crew 1 Route Results</h3>
                        {crewOneRoutes.map((route, routeI) =>
                          <div key={routeI}>
                            <div>Route {routeI + 1}</div>
                            <div>Total distance: {route.distancetotal} inches</div>
                            <ul>
                              {route.nodes.map((node, nodeI) =>
                                <li key={nodeI}>{node}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='td-crew2-results'>
                      <div className='crew2-results'>
                        <h3 className='crew2-results-header'>2. Crew 2 Route Results</h3>
                        {crewTwoRoutes.map((route, routeI) =>
                          <div key={routeI}>
                            <div>Route {routeI + 1}</div>
                            <div>Total distance: {route.distancetotal} inches</div>
                            <ul>
                              {route.nodes.map((node, nodeI) =>
                                <li key={nodeI}>{node}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

Controls.propTypes = {
  onStationFileLoad: PropTypes.func.isRequired,
  onHandrailFilesLoad: PropTypes.func.isRequired,
  onStrFilesLoad: PropTypes.func.isRequired,
  onStartEndHandrailsChange: PropTypes.func.isRequired,
  //onSecondStartEndHandrailsChange: PropTypes.func.isRequired,
  startHandrail: PropTypes.string,							// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Changed startHandrail PropType from object to string
  startHandrailSecond: PropTypes.string,
  endHandrail: PropTypes.string,							// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Changed endHandrail PropType from object to string
  endHandrailSecond: PropTypes.string,
  routes: PropTypes.array.isRequired,
  routesSecond: PropTypes.array.isRequired,
  visibleRoutes: PropTypes.array.isRequired,
  visibleRoutesSecond: PropTypes.array.isRequired,
  onReset: PropTypes.func.isRequired,
  onWingspanChange: PropTypes.func.isRequired,
  onSecondWingspanChange: PropTypes.func.isRequired,
  onRoutesChange: PropTypes.func.isRequired,
  onSecondRoutesChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSecondSumbit: PropTypes.func.isRequired,
  wingspan: PropTypes.number.isRequired,
  wingspanSecond: PropTypes.number.isRequired,
  onCrewTabChange : PropTypes.func.isRequired
};