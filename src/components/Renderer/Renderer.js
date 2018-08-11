/**
 * Project: NASA Path in conjunction with University of Maryland University College
 * @author Group 1 NASA Path team
 * @author Nikki Florea
 */

// March 2018 - Nikki - 
// Modified file to improve color contrast of handrails
// Added glow effect to handrails
// Added in-line documentation

import React from 'react';
import 'utils/stlLoader';
import 'utils/TrackballControls';
import {
  loadMeshFromFile,
  positionModelsBasedOnStrFile,
  createDomEvents,
  bindDomEventsToMeshes,
  unbindDomEventsFromMeshes
} from 'utils/nodeProcessor/nodeProcessor';
import Detector from 'utils/detector';
import Stats from 'stats-js';
import PropTypes from 'prop-types';

// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
// Declare and initialize Raycaster object.
var raycaster = new THREE.Raycaster();

//PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
// Declare and initialize Vector2 object representing the 2D vector of a mouse cursor.
var mouse = new THREE.Vector2();

//PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
// Declare and initialize PerspectiveCamera object.
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.0001, 5000);

//PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/10/2018
// Declare and initialize TrackballControls object.
var controls = new THREE.TrackballControls(camera);

//PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/10/2018
// Declare and initialize Clock object.
var clock = new THREE.Clock();

//PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
// Declare empty array for handrail meshes used to raycast the mouse cursor to each handrail on the model.
var handrailMeshes = [];

// create constructor
export default class Renderer extends React.Component {
  constructor() {
    super();
    
    this.state = {
      hoveredHandrail: null
    };
    
    this.container = null;
    this.stats = null;
    this.cameraTarget = null;
    this.scene = null;
    this.renderer = null;
    this.stationModel = null;
    this.stationModelIsDirty = true;
    this.handrailModels = {};
    this.domEvents = null;
    this.handleHandrailMouseOver = this.handleHandrailMouseOver.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.animate = this.animate.bind(this);
    this.processFiles = this.processFiles.bind(this);
  }

  //enable props (React name for components accepting arbitrary inputs)
  componentWillReceiveProps(newProps) {
    if (this.props.stationFile !== newProps.stationFile) {
      this.stationModelIsDirty = true;
    }
  }

  // 
  componentDidMount() {
	setTimeout(() => this.setState({ loading: false }), 1500); // simulates an async action, and hides the spinner
	// create constants and set values
	const {
		// -- set background and lighting effect values here --
		scene_bg_color = '#000', // black (for navy #0a2044)
		hemisphere_sky_color = '#eff6f7', //light blue
		hemisphere_ground_color = '#eff6f7', //light blue
		hemisphere_intensity = .7
	} = this.props;
	
	// checks for webgl
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
    
    //start position of camera (left-right, up-down, zoom)
    camera.position.set(-1, 0, 2.3);
    this.cameraTarget = new THREE.Vector3(-2, 0, 0);
    
    // create scene object
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(scene_bg_color);

    //PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/10/2018
    // mouse controls to rotate/zoom the model
    controls.rotateSpeed = 3.0;
    controls.zoomSpeed = 3.0;
    controls.panSpeed = 3.0;
    controls.staticMoving = true;
    
    // create lights
    this.scene.add(new THREE.HemisphereLight(hemisphere_sky_color, hemisphere_ground_color, hemisphere_intensity));
    
    // addShadowedLight parameters (x, y, z, color, intensity)
    this.addShadowedLight(1, 1, 1, 0xffffff, .8);
    this.addShadowedLight(0.5, 1, -1, 0xffffff, 1);
    
    // add ambientLight
    const ambientLight = new THREE.AmbientLight(0x2c3e50);
    this.scene.add(ambientLight);
    
    // create renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.renderReverseSided = false;
    this.container.appendChild(this.renderer.domElement);
    this.stats = new Stats();
    
    // create window event listener
    this.container.appendChild(this.stats.domElement);
    window.addEventListener('resize', this.handleWindowResize, false);
    
    // dom events for meshes
    this.domEvents = createDomEvents(camera, this.renderer);
    
    // PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
    // Added onDocumentMouseDown and onDocumentMouseOver event listeners
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
	document.addEventListener('mousemove', this.onDocumentMouseMove, false);
  } //end componentDidMount()

  //check for updates
  componentDidUpdate() {
    this.processFiles();
  }

  //dismount -- does nothing atm
  componentWillUnMount() {
    window.addEventListener('resize', this.handleWindowResize, false);
    // unbindDomEventsFromMeshes(this.handrailModels, this.domEvents, this.domEventsMap);
  }

  //handrail mouseover state
  handleHandrailMouseOver(e) {
    this.setState({hoveredHandrail: e.target});
  };
  
  /**
   * PHASE 3 MOD
   * @author Lincoln Powell/lpowell25@student.umuc.edu
   * @since 8/3/2018
   * 
   * The onDocumentMouseDown function orients the Raycaster, raycaster, object from the camera to the mouse cursor
   * then evaluates if an intersection occurred between the mouse cursor and a handrail on the event a user
   * clicking on a handrail.  If an intersection occurred and as long as a start or end handrail has not been chosen
   * (meaning the start or end handrail dropdown selection equates to null), call the handleStartEndHandrailsChanged(string, object, boolean)
   * handler in the Container.js to fire the onChange event; thus, populating the respective dropdown.
   */
  onDocumentMouseDown = (e) => {
	  e.preventDefault();
	  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
	  raycaster.setFromCamera(mouse, camera);
	  var intersects = raycaster.intersectObjects(handrailMeshes);
	  if (intersects.length > 0) {
		  
		  // If the start handrail or the end handrail equals null (meaning neither handrail has been chosen)
		  // or if the chosen handrail is not the preselected start or end handrail, mark the handrail respectively.
		  if ((!this.props.startHandrail || !this.props.endHandrail) 
				  && this.props.startHandrail != intersects[0].object.name.replace('.stl', '')
				  && this.props.endHandrail != intersects[0].object.name.replace('.stl', '')) {
			  this.props.handleStartEndHandrailsChanged(this.props.startHandrail?'end':'start', intersects[0].object, true);
		  } 
		  
		  // Else if the chosen handrail is the preselected start handrail, clear the start handrail.
		  else if (this.props.startHandrail == intersects[0].object.name.replace('.stl', '')) {
			  this.props.handleStartEndHandrailsChanged('start', null, false);
		  }
		  
		  // Else if the chosen handrail is the preselected end handrail, clear the end handrail.
		  else if (this.props.endHandrail == intersects[0].object.name.replace('.stl', '')) {
			  this.props.handleStartEndHandrailsChanged('end', null, false);
		  }
	  }
  }
  
  /**
   * PHASE 3 MOD
   * @author Lincoln Powell/lpowell25@student.umuc.edu
   * @since 8/3/2018
   * 
   * The onDocumentMouseMove function orients the Raycaster, raycaster, object from the camera to the mouse cursor
   * then evaluates if an intersection occurred between the mouse cursor and a handrail on the event a user
   * moves the cursor over a handrail.  If an intersection occurred, the mouse cursor will be changed to a pointer; else,
   * the mouse cursor will be the default cursor.
   */
  onDocumentMouseMove(e) {
	  e.preventDefault();
	  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
	  raycaster.setFromCamera(mouse, camera);
	  var intersects = raycaster.intersectObjects(handrailMeshes);
	  var canvas = document.body.getElementsByTagName('canvas')[0];
	  if (intersects.length > 0) {
		  canvas.style.cursor = 'pointer';
	  } else {
		  canvas.style.cursor = 'default';
	  }
  }
  
  //create glow material
  buildGlow(vert, frag){
	  //create glow material based on Jerome Etienne's glow
	  var material	= new THREE.ShaderMaterial({
			uniforms: { 
				coeficient: {
					type: "f", 
					value: 1.0
				},
				power : {
					type : "f",
					value : 2
				},
				glowColor : {
					type : "c",
					value : new THREE.Color('pink')
				},
			},
			vertexShader : vert,
			fragmentShader : frag,
			transparent : true,
			depthWrite : false,
	});
	  return material;
};

  //process stl and str files
  processFiles() {
	//create constant props
    const {
      // -- set hand-rail color values here --
      hrColor = '#3f5056', //blue gray
      hrStartColor = '#008000', // green					PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/27/2018 Change start handrail color to green
      hrEndColor = '#EB0000', // red						PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/9/2018 Change end handrail color to red
      stationFile,
      handrailFiles,
      strFiles,
      startHandrail,
      endHandrail,
      routes,
    } = this.props;
    if (!stationFile) {
      return;
    }
    
    //clean model
    if (this.stationModelIsDirty) {
      if (this.stationModel) {
        this.scene.remove(this.stationModel);
        this.stationModel.geometry.dispose();
        this.stationModel.material.dispose();
        this.stationModel = undefined;
      }

      const mesh = loadMeshFromFile(stationFile);
      this.stationModel = mesh;
      this.scene.add(mesh);
      camera.lookAt(mesh);
      this.stationModelIsDirty = false;
    }

  //script that defines the vertex shader for glow
    const vertexShaderSource = `
    	varying vec3	vVertexWorldPosition;
		varying vec3	vVertexNormal;
		varying vec4	vFragColor;
		void main(){
			vVertexNormal	= normalize(normalMatrix * normal);
			vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;
			gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    	}
    `;
    
    //script that defines the fragment shader for glow
    const fragmentShaderSource = `
    	uniform vec3	glowColor;
		uniform float	coeficient;
		uniform float	power;
		varying vec3	vVertexNormal;
		varying vec3	vVertexWorldPosition;
		varying vec4	vFragColor;
		void main(){
			vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;
			vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
			viewCameraToVertex	= normalize(viewCameraToVertex);
			float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);
    		gl_FragColor		= vec4(glowColor, intensity);
    	}
    `;
	
    if (handrailFiles && Object.keys(handrailFiles).length > 0 && strFiles && strFiles.length > 0 ) {
    	Object.values(this.handrailModels).forEach(model => this.scene.remove(model));
    	Object.entries(handrailFiles).forEach(([name, handrailFile]) => {
    		let color = hrColor;
    		let scale = 1;
    		var handrailMesh = loadMeshFromFile(handrailFile, {color}, {scale});
    		
    		// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018
    		// Add each handrail mesh to the handrailMeshes array.  This array is used to raycast the mouse cursor to each handrail on the model.
    		handrailMeshes.push(handrailMesh);
    		
    		// set start/end/route handrail color
    		if (name === startHandrail + '.stl') {
    			//set color of handrail
    			color = hrStartColor;
    			
    			// create handrail
    			handrailMesh = loadMeshFromFile(handrailFile, {color}, {scale});
    			
    			// add glowy-handrail mesh to scene
				var gloMat = this.buildGlow(vertexShaderSource, fragmentShaderSource);
				
				// clone handrail and set material
    			const handrailMeshClone = new THREE.Mesh(handrailMesh.geometry, gloMat);

				// assign glow color
				gloMat.uniforms.glowColor.value	= new THREE.Color(color);
				gloMat.uniforms.coeficient.value = 1.1;
				gloMat.uniforms.power.value	= 1.4;
				
				//scale up clone
    			handrailMeshClone.scale.multiplyScalar(1.2);
				
				//add handrail clone to scene at handrailMesh location
				handrailMesh.add( handrailMeshClone );				
    		} else if (name === endHandrail + '.stl') {
    			// set color of handrail
    			color = hrEndColor;
    			
    			// create handrail 
    			handrailMesh = loadMeshFromFile(handrailFile, {color}, {scale});
    			
    			// add glowy-handrail mesh to scene
				gloMat = this.buildGlow(vertexShaderSource, fragmentShaderSource);
				
				// clone handrail and set material
    			const handrailMeshClone = new THREE.Mesh(handrailMesh.geometry, gloMat);
				
				// assign glow color
				gloMat.uniforms.glowColor.value	= new THREE.Color(color);
				gloMat.uniforms.coeficient.value = 1.1;
				gloMat.uniforms.power.value	= 1.4;
				
				//scale up clone
    			handrailMeshClone.scale.multiplyScalar(1.2);
				
				//add handrail clone to scene at handrailMesh location
				handrailMesh.add( handrailMeshClone );
    		} else {
    			// refactor and exit early or just loop routes outside for performance
    			routes.forEach(route => { 
    				route.nodes.forEach(node => {
    					if (name === `${node}.stl`) {
    						color = route.color;
    						scale = 1;
    						handrailMesh = loadMeshFromFile(handrailFile, {color}, {scale});
    						
    						// add glowy-handrail mesh to scene
    						gloMat = this.buildGlow(vertexShaderSource, fragmentShaderSource);
    						
    						// clone handrail and set material
    		    			const handrailMeshClone = new THREE.Mesh(handrailMesh.geometry, gloMat);
    						
    						// assign glow color
    						gloMat.uniforms.glowColor.value	= new THREE.Color(color);
    						gloMat.uniforms.coeficient.value = 1.1;
    						gloMat.uniforms.power.value	= 1.4;
    						
    						//scale up clone
    		    			handrailMeshClone.scale.multiplyScalar(1.2);
    		    			
    		    			//add handrail clone to scene at handrailMesh location
    						handrailMesh.add( handrailMeshClone );
    					}
    				});
    			});
    		}
    		handrailMesh.name = name;
    		this.handrailModels[name] = handrailMesh;
    		
    		// add handrail mesh to scene
    		this.scene.add(handrailMesh);
    	});
    	strFiles.forEach(strFile => positionModelsBasedOnStrFile(this.handrailModels, strFile));
    }
    this.animate();
  } //end processFiles()
  
  //shadowed light effect
  addShadowedLight(x, y, z, color, intensity) {
	  const directionalLight = new THREE.DirectionalLight(color, intensity);
	  directionalLight.position.set(x, y, z);
	  this.scene.add(directionalLight);
	  directionalLight.castShadow = true;
	  const d = 1;
	  directionalLight.shadow.camera.left = -d;
	  directionalLight.shadow.camera.right = d;
	  directionalLight.shadow.camera.top = d;
	  directionalLight.shadow.camera.bottom = -d;
	  directionalLight.shadow.camera.near = 1;
	  directionalLight.shadow.camera.far = 4;
	  directionalLight.shadow.mapSize.width = 1024;
	  directionalLight.shadow.mapSize.height = 1024;
	  directionalLight.shadow.bias = -0.005;
  }
  
  //handle window
  handleWindowResize() {
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
	  this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  //animate scene movement
  animate() {
	  this.stats.update();
	  var delta = clock.getDelta();
	  controls.update(delta);
	  requestAnimationFrame(this.animate);
	  this.renderer.render(this.scene, camera);
	  
  }

  //render div for state of hovered handrails
  render() {
	  const {
		  loading,
		  hoveredHandrail
	  } = this.state;
	  if(loading) { // if your component doesn't have to wait for an async action, remove this block 
	      return null; // render null when app is not ready
	  }
	  return (
			  <div>
			  	<div className='info-panel'>
			  		{ hoveredHandrail &&
				  <div>
			  		<div>{hoveredHandrail.name}</div>
			  		<div>{Object.values(hoveredHandrail.position).join(', ')}</div>
			  	</div>
			  		}
			  </div>
			  	<div ref={c => this.container = c}></div>
			  </div>
	  );
  }
}

//renderer props
Renderer.propTypes = {
		stationFile: PropTypes.object,
		handrailFiles: PropTypes.object.isRequired,
		strFiles: PropTypes.array.isRequired,
		startHandrail: PropTypes.string,			// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Changed startHandrail PropType from object to string
		endHandrail: PropTypes.string,				// PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 8/3/2018 Changed endHandrail PropType from object to string
		routes: PropTypes.array,
		wingspan: PropTypes.number,
};