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
import {
  loadMeshFromFile,
  positionModelsBasedOnStrFile,
  createDomEvents,
  bindDomEventsToMeshes,
  unbindDomEventsFromMeshes
} from 'utils/nodeProcessor/nodeProcessor';
import Detector from 'utils/detector';
import Stats from 'stats-js';
import OrbitControlsFactory from 'three-orbit-controls';
import PropTypes from 'prop-types';

let OrbitControls = OrbitControlsFactory(THREE);

// create constructor
export default class Renderer extends React.Component {
  constructor() {
    super();
    this.container = null;
    this.stats = null;
    this.camera = null;
    this.cameraTarget = null;
    this.scene = null;
    this.renderer = null;
    this.stationModel = null;
    this.stationModelIsDirty = true;
    this.handrailModels = {};
    this.domEvents = null;
    this.handleHandrailMouseOver = this.handleHandrailMouseOver.bind(this);
    // this.domEventsMap = {
    //   'mouseover': this.handleHandrailMouseOver
    // };
    this.state = {
      hoveredHandrail: null
    };
    this.handleHandrailMouseClick = this.handleHandrailMouseClick.bind(this);
    this.state = {
      clickedHandrail: null
    }
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
	// addition for load progress ------------------------------- 1 line
	setTimeout(() => this.setState({ loading: false }), 1500); // simulates an async action, and hides the spinner
	// create constants and set values
	const {
		// -- set background and lighting effect values here --
		scene_bg_color = '#000', // black (for navy #0a2044)
		hemisphere_sky_color = '#eff6f7', //light blue
		hemisphere_ground_color = '#eff6f7', //light blue
		hemisphere_intensity = .7,
	} = this.props;
	
	// checks for webgl
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
    
    // create camera object
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.0001, 5000);
    //start position of camera (left-right, up-down, zoom)
    this.camera.position.set(-1, 0, 2.3);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    
    // create scene object
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(scene_bg_color);

    // mouse controls to rotate/zoom the model
    new OrbitControls(this.camera);
    
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
    this.domEvents = createDomEvents(this.camera, this.renderer);
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
    //lowPriorityWarning(false, 'Handrail Hovered!');
    //console.log('test');
  };

  //handrail mouse click state
  handleHandrailMouseClick(e) {
    this.setState({clickedHandrail: e.target});
  };
  
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
//      hrStartColor = '#0823d1', // blue					PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/1/2018 Commenting out start handrail color to blue
      hrStartColor = '#008A00', // green					PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/9/2018 Change start handrail color to green
//      hrEndColor = '#7744d6', // purple					PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/1/2018 Commenting out end handrail color to purple
      hrEndColor = '#EB0000', // red						PHASE 3 MOD Lincoln Powell/lpowell25@student.umuc.edu 7/9/2018 Change end handrail color to red
      //hrStartHexColor = 0x0823d1, // blue for light
      //hrEndHexColor = 0x7744d6, // purple for light
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
      this.camera.lookAt(mesh);
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
    		
    		// set start/end/route handrail color
    		if (startHandrail && name === `${startHandrail.value}.stl`) {
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
	
    			//give it it's own light
    			//var light = new THREE.PointLight( hrStartHexColor, .5, .3 );
    		    //handrailMesh.add(light);				
    		} else if (endHandrail && name === `${endHandrail.value}.stl`) {
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

    			//give it it's own light
    			//light = new THREE.PointLight( hrEndHexColor, .5, .3 );
    		    //handrailMesh.add(light);
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
    	// bindDomEventsToMeshes(this.handrailModels, this.domEvents, this.domEventsMap);
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
	  this.camera.aspect = window.innerWidth / window.innerHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  //animate scene movement
  animate() {
	  requestAnimationFrame(this.animate);
	  this.camera.lookAt(this.cameraTarget);
	  this.renderer.render(this.scene, this.camera);
	  this.stats.update();
  }

  //render div for state of hovered handrails
  render() {
	  const {
		  // addition for load progress ------------------------------- 1 line
		  loading,
		  hoveredHandrail
	  } = this.state;
	  // addition for load progress ------------------------------- 3 lines
	  if(loading) { // if your component doesn't have to wait for an async action, remove this block 
	      return null; // render null when app is not ready
	  }
	  return (
			  <div>
			  <div className='info-panel'>
			  {hoveredHandrail &&
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
		startHandrail: PropTypes.object,
		endHandrail: PropTypes.object,
		routes: PropTypes.array,
		wingspan: PropTypes.number,
};
