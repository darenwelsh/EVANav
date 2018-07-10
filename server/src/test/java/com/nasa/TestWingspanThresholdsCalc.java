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

import java.util.Scanner;

/**
 * Project: NASA Path in conjunction with University of Maryland University
 * College
 *
 * @author jusw
 */
public class TestWingspanThresholdsCalc {

    public static void main(String[] args) {

        RouteRequest rr = new RouteRequest();
        
        //Allow input of wingspan value
        Scanner input = new Scanner(System.in);
        System.out.println("Enter wingspan: ");
        String wingspan = input.nextLine();
        System.out.println();
        
        //Set the wingspan
        rr.setWingspan(wingspan);

        //Print the thresholds using the wingspan value that will be used for the shortest path calculation
        Double[] thresholds = rr.getWinsgspanThresholds();
        
        //Calculate the correct thresholds
        Double wingspanInches = Double.parseDouble(wingspan) * 12.0;
        Double[] correctThresholds = {wingspanInches, (wingspanInches + 8.0), (wingspanInches + 16.0)};
        
        //Check if the calculated thresholds are correct
        if (Arrays.equals(thresholds, correctThresholds)) {
        	System.out.println("Test passed!");
        } else {
        	System.out.println("Test failed!");
        }
    }
}