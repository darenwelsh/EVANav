/*
 * Copyright (C) 2017 jadovan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.nasa;

/**
 * Project: NASA Path in conjunction with University of Maryland University
 * College
 *
 * @author jadovan
 */

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class DijkstraPaths {
	private List<Node> nodes;
	private List<Edge> edges;
	private ArrayList<String> nodeIndexList;
	private static final Logger logger = LogManager.getLogger(DijkstraPaths.class);
	protected CreateNodes cn = new CreateNodes();

	public List<Node> getShortestPath(String source, String destination, List<Node> nodes, double weight) {
		nodeIndexList = new ArrayList<String>();
		for (Node node : nodes) {
			nodeIndexList.add(node.getNodeId());
		}
		int sourceIndex = nodeIndexList.indexOf(source);
		int destinationIndex = nodeIndexList.indexOf(destination);
		Graph graph1 = new Graph(nodes, getEdgesFromNodes(nodes, weight));
		Dijkstra dijkstra1 = new Dijkstra(graph1);
		dijkstra1.execute(nodes.get(sourceIndex));
		return dijkstra1.getPath(nodes.get(destinationIndex));
	}

	// This method processes the Dijkstra Algorithm for the three shortest paths
	public void ExecutePaths(String source, String destination) {

		//cn.createHandNodeList();

		/* *********************************************************************
        * The following lines executes the Dijkstra Algorithm by retrieving the
        * ArrayList index number of the source and destination nodes entered.
        * This process is evaluated in the TestDijkstraPaths.java file utilizing
        * the Scanner method. This executes the first shortest path.
        ********************************************************************* */
		int sourceIndex = cn.nodeIndexList.indexOf(source);
		int destinationIndex = cn.nodeIndexList.indexOf(destination);
		Graph graph = new Graph(pathNodes(), pathOneEdges());
		Dijkstra dijkstra = new Dijkstra(graph);
		dijkstra.execute(nodes.get(sourceIndex));
		LinkedList<Node> path = dijkstra.getPath(nodes.get(destinationIndex));

		logger.info("1st path from " + nodes.get(sourceIndex).getNodeId() + " to "
				+ nodes.get(destinationIndex).getNodeId());

		if (path != null) {
			path.forEach((node1) -> {
				logger.info(node1.getNodeId());
			});
		} else {
			logger.warn("1st path could not be determined between these nodes.");
		}

		/* *********************************************************************
        * The following lines executes the Dijkstra Algorithm by retrieving the
        * ArrayList index number of the source and destination nodes entered.
        * This process is evaluated in the TestDijkstraPaths.java file utilizing
        * the Scanner method. This executes the second shortest path.
        ********************************************************************* */
		graph = new Graph(pathNodes(), pathTwoEdges());
		dijkstra = new Dijkstra(graph);
		dijkstra.execute(nodes.get(sourceIndex));
		path = dijkstra.getPath(nodes.get(destinationIndex));

		logger.info("2nd path from " + nodes.get(sourceIndex).getNodeId() + " to "
				+ nodes.get(destinationIndex).getNodeId());

		if (path != null) {
			path.forEach((node2) -> {
				logger.info(node2.getNodeId());
			});
		} else {
			logger.warn("2nd path could not be determined between these nodes.");
		}

		/* *********************************************************************
        * The following lines executes the Dijkstra Algorithm by retrieving the
        * ArrayList index number of the source and destination nodes entered.
        * This process is evaluated in the TestDijkstraPaths.java file utilizing
        * the Scanner method. This exeuctes the third shortest path.
        ********************************************************************* */
		graph = new Graph(pathNodes(), pathThreeEdges());
		dijkstra = new Dijkstra(graph);
		dijkstra.execute(nodes.get(sourceIndex));
		path = dijkstra.getPath(nodes.get(destinationIndex));

		logger.info("3rd path from " + nodes.get(sourceIndex).getNodeId() + " to "
				+ nodes.get(destinationIndex).getNodeId());

		if (path != null) {
			path.forEach((node3) -> {
				logger.info(node3.getNodeId());
			});
		} else {
			logger.warn("3rd path could not be determined between these nodes.");
		}

	}

	// This method is used for creating the Edge lanes to be processed by the
	// Dijkstra Algorithm
	private void addLane(String laneId, int sourceLocNo, int destLocNo, double duration) {
		Edge lane = new Edge(laneId, nodes.get(sourceLocNo), nodes.get(destLocNo), duration);
		edges.add(lane);
	}

	// This method adds node locations for the shortest paths
	private List<Node> pathNodes() {
		nodes = new ArrayList<>();

		//cn.createHandNodeList();

		// These for loops add lanes to the s0 and lab nodes for the shortest paths
		for (int i = 0; i < cn.nodeList.size(); i++) {
			Node location = new Node(cn.nodeList.get(i).getNodeId());
			nodes.add(location);
		}

		return nodes;
	}

	private List<Edge> getEdgesFromNodes(List<Node> nodes, double weightThreshold) {
		ArrayList<Edge> edges = new ArrayList<>();
		for (int j = 0; j < nodes.size(); j++) {
			for (int k = 0; k < nodes.size(); k++) {
				String s0LabNodesJ = nodeIndexList.get(j);
				String s0LabNodesK = nodeIndexList.get(k);
				double weight = cn.node_distance_formula(nodes.get(j), nodes.get(k));
				if (weight <= weightThreshold) {
					String laneId = "Edge_" + j;
					Edge lane = new Edge(laneId, nodes.get(nodeIndexList.indexOf(s0LabNodesJ)),
							nodes.get(nodeIndexList.indexOf(s0LabNodesK)), weight);
					edges.add(lane);
				}
			}

		}
		return edges;
	}

	// This method adds lanes for the first shortest path
	private List<Edge> pathOneEdges() {
		edges = new ArrayList<>();

		//cn.createHandNodeList();

		for (int j = 0; j < cn.nodeList.size(); j++) {
			for (int k = 0; k < cn.nodeList.size(); k++) {
				String s0LabNodesJ = cn.nodeIndexList.get(j);
				String s0LabNodesK = cn.nodeIndexList.get(k);
				double weight = cn.node_distance_formula(cn.nodeList.get(j), cn.nodeList.get(k));
				if (weight <= 46) {
					addLane("Edge_" + j, cn.nodeIndexList.indexOf(s0LabNodesJ),
							cn.nodeIndexList.indexOf(s0LabNodesK), weight);
				}
			}

		}
		return edges;
	}

	// This method adds lanes for the second shortest path
	private List<Edge> pathTwoEdges() {
		edges = new ArrayList<>();

		//cn.createHandNodeList();
		int size = cn.nodeList.size();

		for (int j = 0; j < size; j++) {
			for (int k = 0; k < size; k++) {
				String s0LabNodesJ = cn.nodeIndexList.get(j);
				String s0LabNodesK = cn.nodeIndexList.get(k);
				double weight = cn.node_distance_formula(cn.nodeList.get(j), cn.nodeList.get(k));
				if (weight <= 54) {
					addLane("Edge_" + j, cn.nodeIndexList.indexOf(s0LabNodesJ),
							cn.nodeIndexList.indexOf(s0LabNodesK), weight);
				}
			}

		}
		return edges;
	}

	// This method adds lanes for the third shortest path
	private List<Edge> pathThreeEdges() {
		edges = new ArrayList<>();

		//cn.createHandNodeList();
		int size = cn.nodeList.size();

		for (int j = 0; j < size; j++) {
			for (int k = 0; k < size; k++) {
				String s0LabNodesJ = cn.nodeIndexList.get(j);
				String s0LabNodesK = cn.nodeIndexList.get(k);
				double weight = cn.node_distance_formula(cn.nodeList.get(j),
						cn.nodeList.get(k));
				if (weight <= 62) {
					addLane("Edge_" + j, cn.nodeIndexList.indexOf(s0LabNodesJ),
							cn.nodeIndexList.indexOf(s0LabNodesK), weight);
				}
			}

		}
		return edges;
	}
}