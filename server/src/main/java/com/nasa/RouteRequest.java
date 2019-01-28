package com.nasa;

import java.util.ArrayList;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

//August 2018 - Deepali Varma- 
//Added modifications in Dijkstra Alorithim paths to use the wingspan slider input to effect the potential paths calculated

public class RouteRequest {
	private String startHandrail;
	private String endHandrail;
	private ArrayList<Node> nodes;
	private String wingspan;
	private static final Logger logger = LogManager.getLogger(RouteRequest.class);

	public RouteRequest(String startHandrail, String endHandrail, ArrayList<Node> nodes, String wingspan) {
		this.startHandrail = startHandrail;
		this.endHandrail = endHandrail;
		this.nodes = nodes;
		this.wingspan = wingspan;
	}

	public Double getWingspanThresholds(int i) {
		// Convert the wingspan value from feet to inches
		Double wingspanInches = Double.parseDouble(this.wingspan) * 12.0;

		// Thresholds for paths are the wingspan distance decremented by 4 inches for
		// each path
		Double[] thresholds = { (wingspanInches), (wingspanInches - 4.0), (wingspanInches - 8.0) };
		
		logger.info("Wingspan : " + wingspan + " ft --> " + Double.toString(thresholds[i]) + " in");
		
		return thresholds[i];
	}

	/**This is the size of thresholds in getWingspanThresholds  */	
	public int getThresholdSize(){
		return 3;
	}

	public void setStartHandrail(String startHandrail) {
		this.startHandrail = startHandrail;
	}

	public void setEndHandrail(String endHandrail) {
		this.endHandrail = endHandrail;
	}

	public void setNodes(ArrayList<Node> nodes) {
		this.nodes = nodes;
	}

	public void setWingspan(String wingspan) {
		this.wingspan = wingspan;
	}

	public String getStartHandrail() {
		return this.startHandrail;
	}

	public String getEndHandrail() {
		return this.endHandrail;
	}

	public ArrayList<Node> getNodes() {
		return this.nodes;
	}

	public String getWingspan() {
		return this.wingspan;
	}
}