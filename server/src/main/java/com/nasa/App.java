package com.nasa;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import fi.iki.elonen.NanoHTTPD.Response;
// NanoHTTPD < v3.0.0 
import fi.iki.elonen.NanoHTTPD;
// April 2018 - George - Added code to Add distances between each handrail pair in each path here and in Container.js 
// NanoHTTPD > v3.0.0

//July 2018 - Deepali Varma- 
//Added distances between each handrail pair in each path
//Modified the file to truncate the distance and distancetotal to one decimal

//import org.nanohttpd.NanoHTTPD;

/*
  example client request body
  {
    startHandrail: 'ABC',
    endHandrail: 'XYZ',
    nodes: [{
      "unique_node_name": "HWY_XXX",
      "geometry_file_name": "HWY_XXX.stl",
      "x": "221.42",
      "y": "0.00",
      "z": "190.95",
      "pitch": "180.00",
      "yaw": "0.00",
      "roll": "180.00",
      "parent_node_name": "SSREF"
    },
    {
      "unique_node_name": "HWY_XXX",
      "geometry_file_name": "HWY_XXX.stl",
      "x": "221.42",
      "y": "0.00",
      "z": "190.95",
      "pitch": "180.00",
      "yaw": "0.00",
      "roll": "180.00",
      "parent_node_name": "SSREF"
    }],
  }
*/

public class App extends NanoHTTPD {
	private static final Logger logger = LogManager.getLogger(App.class);

	public App() throws IOException {
		super(8080);
		logger.traceEntry();
		start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
		logger.info("Running at port 8080");
		logger.traceExit();
	}

	public static void main(String[] args) {
		logger.traceEntry();
		try {
			new App();
		} catch(IOException ioe) {
			logger.error("Couldn't start server", ioe);
		}
		logger.traceExit();
	}

	@Override
	public Response serve(IHTTPSession session) {
		logger.traceEntry();
		Map < String,
		String > map = new HashMap < String,
		String > ();
		Method method = session.getMethod();

		// Parse map for all PUTs and POSTs
		if (Method.PUT.equals(method) || Method.POST.equals(method)) {
			try {
				session.parseBody(map);
			} catch (IOException ioe) {
				return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: IOException: " + ioe.getMessage());
			} catch (ResponseException re) {
				return newFixedLengthResponse(re.getStatus(), MIME_PLAINTEXT, re.getMessage());
			}
		}

		// Get POST request
		String postBody = map.get("postData");
		Gson gson = new Gson();
		RouteRequest rr = new RouteRequest("", "", new ArrayList < Node > (), "");
		try {
			rr = gson.fromJson(postBody, RouteRequest.class);
		} catch(Exception e) {
			logger.error("",  e);
		}

		// Output start and end points to console
		logger.info("Start: " + rr.getStartHandrail());
		logger.info("End: " + rr.getEndHandrail());
		//System.out.println("Running algorithm...");	JUSW COMMENTED - Moved line below

		DijkstraPaths dp = new DijkstraPaths();
		ArrayList < List < Node >> listOfNodeLists = new ArrayList < List < Node >> ();
		String resultListsString = "";
		//int[] thresholds = {46, 54, 62};	' JUSW COMMENTED - Replaced with wingspan value calculation in RouteRequest

		logger.info("Running algorithm...");

		// Apply Dijkstra's algorithm to calculate shortest path
		for (int i = 0; i < rr.getWingspanThresholds().length; i++) {
			List < Node > nodes = new ArrayList < Node > ();
			ArrayList < String > nodeIds = new ArrayList < String > ();

			// Pull list of shortest path nodes, throw exception for any calculation errors
			try {
				nodes = dp.getShortestPath(rr.getStartHandrail(), rr.getEndHandrail(), rr.getNodes(), rr.getWingspanThresholds()[i]);
			} catch(Exception e) {
				logger.error("There was an error running the algorithm", e);
			}

			// Get shortest path node list
			listOfNodeLists.add(nodes);
			double distancetotal = 0;

			// If the shortest path is not NULL, write the node list with distances to console
			if (nodes == null) {
				logger.warn("There is no path");
			} else {
				logger.info("Route " + (i + 1));
				Node nodeLast = null;
				double distance = 0;

				// Loop through each node to display handrail and calculate distance
				for (Node node: nodes) {
					String nodeId = node.getNodeId();

					// For each handrail after the first, calculate distance between previous and current handrail
					// For each handrail distance tally up the total distance between the first handrail and the last
					// Truncate the distancetotal to one decimals
					try {
						if (nodeLast != null) {
							distance = node.node_distance_formula(node, nodeLast);
							distance = ((double) Math.round(distance * 10)) / 10;
							distancetotal += distance;
							distancetotal = (double) Math.round(distancetotal * 10) / 10;
						}
					} catch(Exception ex) {
						logger.error("Error calculating handrail distance", ex);
					}

					//Added distances between each handrail pair in each path

					if (distance != 0.0) {
						nodeIds.add(Double.toString(distance) + "\"");
					}
					nodeIds.add(nodeId);

					// Output handrail name and distance from last.
					logger.info(nodeId + " [" + distance + " in.]");
					nodeLast = node;
				}
			}

			/*
        	use nodes to process shortest path and return a json array of routes documented in architecture document. For example,
        	[
          	{
            	nodes: [list of node ids],
            	...otherMetaDataProperties
          	}
        	]
	       */
			resultListsString += "{\"distancetotal\":" + distancetotal + ",\"nodes\":" + gson.toJson(nodeIds) + "}";

			// Add delimiter for each but last
			if (i != rr.getWingspanThresholds().length - 1) {
				resultListsString += ", ";
			}
		}

		logger.info("All done!");

		// Configure and return response
		String resultJson = "[" + resultListsString + "]";
		Response response = newFixedLengthResponse(resultJson);
		response.addHeader("Access-Control-Allow-Origin", "*");

		return logger.traceExit(response);
	}

	//  public Double[] getWingspanThresholds(Double wingspan) {   
	//	    // Convert the wingspan value from feet to inches
	//	  	Double wingspanInches = wingspan * 12.0;
	//		System.out.println("Wingspan : " + wingspan + " ft --> " + Double.toString(wingspanInches) + " in");
	//		    
	//		// Thresholds for paths are the wingspan distance incremented by 8 inches for each path
	//		Double[] thresholds = {wingspanInches, (wingspanInches + 8.0), (wingspanInches + 16.0)};	
	//		System.out.println("Thresholds: {" + wingspanInches + ", " + (wingspanInches + 8.0) + ", " + (wingspanInches + 16.0) + "}");
	//		
	//		return thresholds;
	//	  }
}