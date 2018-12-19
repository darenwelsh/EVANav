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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Project: NASA Path in conjunction with University of Maryland University
 * College
 *
 * @author jadovan
 * 
 *         Update to accept environment variable instead of hard coded location.
 * @author Nikki Florea
 */
public class CreateNodes extends Node {
    /**
     * The following locations take the current system location to determine the
     * correct application directory.
     * TODO: make sure user.dir has the same behavior on Mac OS 
     */
    String homeDir = System.getProperty("user.dir");
    private final String ENTIRE_ISS = homeDir + "\\server\\src\\main\\resources\\Entire_ISS.txt";    
    private final String ENTIRE_ISS_DISTANCE = homeDir + "\\server\\src\\main\\resources\\Entire_ISS_DISTANCE.txt";
    /**
     * The following locations take the current system location to determine the
     * correct application directory.
     */
    File file = new File(homeDir + "\\public\\models\\Handrails\\Entire_ISS.str");

    Node node = new Node(); 
    List<Node> nodeList = new ArrayList<>();
    List<String> nodeIndexList = new ArrayList<>();

    private double nodeDistance;
    private String nodeDistanceString;

    private BufferedWriter bw = null;

    private FileWriter fw = null;

    public CreateNodes() {
		createHandNodeList();
    }
    
    /**Create a list of node off the str file {@value this.ENTIRE_ISS}*/
    public void createHandNodeList() {

        try {   
            Scanner inputFile1 = new Scanner(file);

            fw = new FileWriter(ENTIRE_ISS);
            bw = new BufferedWriter(fw);
            String nodeName, fileName, parentNodeName;
            Double x, y, z, pitch, yaw, roll;

            while (inputFile1.hasNext()) {
                nodeName = inputFile1.nextLine();
                fileName = inputFile1.nextLine();
                x =  Double.parseDouble(inputFile1.next());
                y =  Double.parseDouble(inputFile1.next());
                z =  Double.parseDouble(inputFile1.nextLine());
                pitch =  Double.parseDouble(inputFile1.next());
                yaw =  Double.parseDouble(inputFile1.next());
                roll =  Double.parseDouble(inputFile1.nextLine());
                parentNodeName = inputFile1.nextLine();

                node = new Node(nodeName, fileName, x, y, z, pitch, yaw,roll, parentNodeName);

                bw.write(node.toString() + "\r\n");
                nodeList.add(node);
                nodeIndexList.add(node.getNodeId());
            }

            inputFile1.close();

        } catch (IOException e) {
            e.getStackTrace();
        } finally {
            try {
                if (bw != null) {
                    bw.close();
                }
                if (fw != null) {
                    fw.close();
                }
            } catch (IOException ex) {
                ex.getStackTrace();
            }
        }

    }

    public List<Node> getNodeList() {
        return nodeList;
    }

    public void createHandNodeListDistances() {

        try {

            fw = new FileWriter(ENTIRE_ISS_DISTANCE);
            bw = new BufferedWriter(fw);
            int size = nodeList.size();

            for (int i = 0; i < size; i++) {
                for (int j = 0; j < size; j++) {
                    nodeDistance = node.node_distance_formula(nodeList.get(i), nodeList.get(j));
                    nodeDistanceString = "Distance from node " + nodeList.get(i).getNodeId() + " to node "
                            + nodeList.get(j).getNodeId() + " is: " + nodeDistance + "\r\n";
                    bw.write(nodeDistanceString);
                }
            }

        } catch (IOException e) {
            e.getStackTrace();
        } finally {
            try {
                if (bw != null) {
                    bw.close();
                }
                if (fw != null) {
                    fw.close();
                }
            } catch (IOException ex) {
                ex.getStackTrace();
            }
        }
    }
}