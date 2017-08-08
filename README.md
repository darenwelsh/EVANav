# EVANav
Navigation for space walks

## GENERAL CONCEPT
Imagine using Google Maps and Navigation, but as a space walker on the Space Station.

Flight controllers and astronauts at NASA use a 3D model of the International Space Station (ISS) to aid in the planning and execution of ExtraVehicular Activity (EVA, or "space walks"). This model (named "DOUG") includes all of the modules and hardware on ISS as well as each handrail used by an EVA crew member to aid in translation. Determining the "best" path from one location on ISS to another is currently done by trained, experienced humans. This project is to use computing power to aid those humans.

The user interface should allow for selection of start and end points, each different handrails. The user may also choose options for the route. The default will be the shortest route, but the user may want the route that encounters the least amount of hazards (sharp edges, radiating hardware, articulating structures, shatterable materials, etc), a route that deconflicts their partner's route (EVAs are performed by a pair of crew), a route including one or more waypoints in the middle of the route, and/or a route with the fewest number of rotations and plane changes. The user may also choose to enter the value for the crew member's wingspan. This is important in places where handrails are spaced farther apart than some people's reach limit.

The algorithm will then calculate the ideal route and output the results. The basic output should be a sequential list of handrail numbers and the distance between each pair of handrails along the path. A long term goal is to output the results in a way that DOUG can read so the path can be highlighted and centered in the viewing frame.

## REQUIREMENTS & ASSUMPTIONS
1. For this project, assume only handrails can be used to aid in translation (though it is common for EV crew to use structural beams in places where handrails are sparse).
1. UI should include start and end points
1. UI should allow optional waypoints in the middle of the route
1. UI should allow for two simultaneous routes (one for each crew member)
1. UI should allow options for route determination
   1. Avoid crew hazards (things that hurt the crew or their suit)
   1. Avoid hardware hazards (things that could by hurt by the crew)
   1. Deconflict partner's route (don't use the same handrails)
   1. Minimize rotations and plane changes (movement from one face to another around a module)
   1. Field to enter crew member's wingspan
1. Output should include sequential list of handrail numbers, including distance between each pair of handrails
1. Output should be in a format readable by DOUG

## SAMPLE DATA


## RELATED WORK
See [ISSMaps](https://github.com/darenwelsh/ISSMaps), my first attempt at this. I didn't get very far, but it may be helpful.
