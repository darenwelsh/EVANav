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

import java.util.ArrayList;
import java.util.Arrays;

/**
 * Project: NASA Path in conjunction with University of Maryland University
 * College
 *
 * @author jusw
 */
public class TestWingspanThresholdsCalc {

    public static void main(String[] args) {

        RouteRequest rr = new RouteRequest("", "", new ArrayList<Node>(), "");

        // Allow input of wingspan value
        String wingspan = "4";

        // Set the wingspan
        rr.setWingspan(wingspan);

        // Print the thresholds using the wingspan value that will be used for the
        // shortest path calculation
        Double[] thresholds = {rr.getWingspanThresholds(0),rr.getWingspanThresholds(1),rr.getWingspanThresholds(2)};

        // Calculate the correct thresholds
        Double wingspanInches = Double.parseDouble(wingspan) * 12.0;
        Double[] correctThresholds = { wingspanInches, (wingspanInches - 4.0), (wingspanInches - 8.0) };

        // Check if the calculated thresholds are correct
        if (Arrays.equals(thresholds, correctThresholds)) {
            System.out.println("Test passed!");
        } else {
            System.out.println("Test failed!");
        }
    }
}