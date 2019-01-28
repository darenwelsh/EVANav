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

import java.io.FileNotFoundException;

/**
 * Project: NASA Path in conjunction with University of Maryland University
 * College
 *
 * @author jadovan
 */
public class TestCreateNodes {

    /* ************************************************************************
    * This main class executes the CreateNodes.java methods and writes the data
    * to specified .txt files and adds the nodes to ArrayLists
    ************************************************************************ */
    public static void main(String[] args) throws FileNotFoundException {
        CreateNodes cn = new CreateNodes();
        //cn.createHandNodeList();
        cn.createHandNodeListDistances();
    }
}
