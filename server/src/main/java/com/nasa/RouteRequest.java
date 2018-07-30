package com.nasa;

import java.util.ArrayList;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class RouteRequest {
	private String startHandrail;
	private String endHandrail;
	private ArrayList < Node > nodes;
	private String wingspan;
	private static final Logger logger = LogManager.getLogger(RouteRequest.class);

	public RouteRequest(String startHandrail, String endHandrail, ArrayList < Node > nodes, String wingspan) {
		this.startHandrail = startHandrail;
		this.endHandrail = endHandrail;
		this.nodes = nodes;
		this.wingspan = wingspan;
	}

	public Double[] getWingspanThresholds() {
		// Convert the wingspan value from feet to inches
		Double wingspanInches = Double.parseDouble(this.wingspan) * 12.0;
		logger.info("Wingspan : " + wingspan + " ft --> " + Double.toString(wingspanInches) + " in");

		// Thresholds for paths are the wingspan distance incremented by 8 inches for each path
		Double[] thresholds = {
			wingspanInches,
			(wingspanInches + 8.0),
			(wingspanInches + 16.0)
		};
		logger.info("Thresholds: {" + wingspanInches + ", " + (wingspanInches + 8.0) + ", " + (wingspanInches + 16.0) + "}");

		return thresholds;
	}

	public void setStartHandrail(String startHandrail) {
		this.startHandrail = startHandrail;
	}
	
	public void setEndHandrail(String endHandrail) {
		this.endHandrail = endHandrail;
	}
	
	public void setNodes(ArrayList < Node > nodes) {
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
	
	public ArrayList < Node > getNodes() {
		return this.nodes;
	}
	
	public String getWingspan() {
		return this.wingspan;
	}
}