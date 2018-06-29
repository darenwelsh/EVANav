## Project Overview
Using Dijkstra's algorithm, find the most efficient path of handrails along the exterior of the ISS when navigating from Point A to Point B.  A 3D Model
of the ISS is used to select, configure, and highlight calculated path.  Astronaut wingspan, additional intermediate points, and hazards should be taken into 
consideration when calculating the optimal path(s).  

#### Phase 1 (Fall 2017)
Phase 1 Repository README.md details Linux installation instructions.  

Repository: <https://github.com/lovetostrike/nasa-path-finder>  
Demo: <https://lovetostrike.github.io/nasa-path-finder/demo.html>  
Site: <https://lovetostrike.github.io/nasa-path-finder/>  

#### Phase 2 (Spring 2018)
Phase 2 Repository complete Release Notes listed below.

Repository: <https://github.com/xpaddict/nasa-path-finder>  
User Manual Documentation: ```/docs/User_Manual.docx```  
Lessons Learned: ```/docs/Lessons_Learned.doc``` 

## Dependencies
#### Front-End
Jest: 		Test Execution  
Node.js: 	Package Management  
React.js: 	UI Rendering Library  
Three.js: 	3D Rendering  
Webpack:	Module Management  
Yarn:		Package Management  

#### Back-End
AJAX: 		Asynchronous Algorithm Display  
Java:		Software Platform  

#### Supplemental Tools
CircleCI: 	Continuous Integration  
Docker: 	Web Building and Packaging  
Eletron: 	Build Management  
GitHub:		Code Repository  

## Installation and Configuration

#### Dependency Installation
Install Node.js <https://nodejs.org/en/>  
Install Yarn <https://yarnpkg.com/en/docs/install>  
Install/Update Java 8 <https://www.java.com/en/download/>  
Install Maven (Apache Maven Project) <https://maven.apache.org/>  
Install Python <https://www.python.org/downloads/>  
Install Visual Studio <https://www.visualstudio.com/downloads/> (Free community version available)  

#### Configuration
1. Environment Variables: Add or Update Windows Environment Paths to include the following...   
   - JAVA_HOME - Set to Java 8 JDK installation folder  
   - M2_HOME - Set to location of Maven installation folder  
   - MAVEN_HOME - Set to location of Maven installation folder  
   - Path - Include new path record "%M2_HOME%\bin"  

2. Yarn Dependencies  
Using command line, download all yarn dependencies by navigating to the root of the project executing:  
```yarn```  
This step may take several minutes.

## Execution
NASA Path Finder now supports both Linux and Windows execution, the commands to compile and start the application are slightly different

#### Linux
1. In first command line window, navigate to root of the project directory and execute: ```yarn start```  
2. In a second command line window, navigate to root of the project directory and execute: ```yarn compile:start:server```  
3. Navigate to <http://localhost:3000> or <http://127.0.0.1:3000>

#### Windows
1. In first command line window, navigate to root of the project directory and execute: ```yarn start```  
2. In a second command line window, navigate to root of the project directory and execute: ```yarn compilewin:start:server```  
3. Navigate to <http://localhost:3000> or <http://127.0.0.1:3000>

## Development Structure
API code can be found in ```/src/utils/```.  
UI and React components can be found in ```/src/components/```.  
Core UI functionality can be found in ```/server/src/main/java/com/nasa/```.  

## Phase 2 - Release Notes
#### Documentation
- In-line code documentation to core pages and elements  
- User Manual to serve as a single, comprehensive reference
- Installation instructions for Windows and Ubuntu
- Registration and installation instructions for DOUG Software

#### Installation
- Compilation for Windows while keeping Linux compile intact
- Windows Batch file "run_nasa.bat" - launches all command and browser windows to execute application
- Ubuntu Bash file ".run_nasa" - launches software from terminal window
- Revised CreateNodes.java to dynamically point to resource files instead of requiring manual installation step

#### User Interface
- Verification of all basic functionality
- New add-ins to provide more defined and visible route illustrations  
- Updated route colors to increase visibility
- Moved pathing results to a new "Results" Tab to create additional space on "Controls" Tab
- Created ISS Model 92% of full size, which renders successfully
- Verification of UI functionality to drag and drop new model / handrail files

#### Pathing Logic
- Wingspan selection factors into each calculated path criteria 
- Wingspan choice prints in console window
- Wingspan thresholds print in console window 
- Node graph test of shortest paths against software output to verify functionality
- Total Distance (in inches) displays on Path Results tab and Console window

## Tasks in Progress
- Update model to include all of ISS with complete handrail list
- Display distances between each handrail pair for each path
- Allow users to click handrail in the 3D Model to select start and end points

## Remaining Backlog
 1. Add UI and update Route 2 calculation to avoid hazards - hazard path should observe and avoid volume around hazard
 2. Add UI and update calculation accounting for 2 crew members, to deconflict routes
 3. Add UI and update calculation to allow additional waypoint(s)
 4. Add UI and update calculation to minimize suit rotations and plane changes (translating around corners and edges)
 5. Display tether routing
 6. Deconflict tethers from two crew
 7. Suggest fairleads to avoid hazards
 8. Integrate output into DOUG application
 9. Display route handrails in different color if they approach wingspan max distance
10. Strafe/Pan of the 3D Model center to move the entire model directionally
11. Incorporate geometric shape of modules into distance calculations
12. Update Route 3 calculation to specified logic (TBD)

## Milestone 3 Interface
![Milestone 3 UI Screenshot](/ui-html/images/pathing_one.png)