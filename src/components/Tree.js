import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import "../css/Tree.css";

var height = 1000;
var width = 1500;

export default function Tree() {
  const [update, setUpdate] = useState(false);
  const [tableData, setTableData] = useState();
  var treeData = [];

  useEffect(() => {
    Axios.get("https://layfamily.herokuapp.com/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  //triggers a data request
  const updateTree = () => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  //convert to hierarchal tree form using d3.stratify()
  const converttreeData = () => {
    treeData = tableData;
    let partners = treeData.filter((x) => x.isPartner === 1);
    treeData = treeData.filter((x) => x.isPartner !== 1);
    console.log(partners);
    console.log(treeData);
    for (let i = 0; i < partners.length; i++) {
      //get name of parent node
      //make partner object an attribute of parent node (partnerinfo)
      for (let x = 0; x < treeData.length; x++) {
        if (treeData[x].id === partners[i].pid) {
          treeData[x].partnerinfo = partners[i];
          console.log("partner appended to " + treeData[x].name);
        }
      }
    }

    treeData = d3
      .stratify()
      .id((d) => d["id"])
      .parentId((d) => d["pid"])(treeData);
    console.log(treeData);
  };

  const buildTree = () => {
    converttreeData();
    updateTree();

    var treeLayout = d3.tree();
    treeLayout.nodeSize([175, 150]);
    treeLayout(treeData);
    var linksData = treeData.links();
    // Nodes
    var rectangles = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());
    rectangles
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "node level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 75;
      })
      .attr("y", function (d) {
        return d.y - 50;
      });

    var links = d3.select("svg g.links").selectAll("path").data(linksData);
    links
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "link level-" + d.source.depth;
      })
      .attr("d", function (d) {
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          " C " +
          d.source.x +
          "," +
          (d.source.y + d.target.y) / 2 +
          " " +
          d.target.x +
          "," +
          (d.source.y + d.target.y) / 2 +
          " " +
          d.target.x +
          "," +
          d.target.y
        );
      })
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
    console.log(treeData.descendants());

    var names = d3
      .select("svg")
      .append("g")
      .selectAll("text")
      .data(treeData.descendants());
    names
      .enter()
      .append("text")
      .text(function (d) {
        return `${d.data.name}`;
      })
      .attr("class", function (d) {
        return "text level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + width / 4 + 225;
      })
      .attr("y", function (d) {
        return d.y + 160;
      });
    names
      .enter()
      .append("text")
      .attr("class", function (d) {
        return "text level-" + d.depth;
      })
      .text(function (d) {
        return `${d.data.birthdate}`;
      })
      .attr("x", function (d) {
        return d.x + width / 4 + 225;
      })
      .attr("y", function (d) {
        return d.y + 185;
      });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          buildTree();
        }}
      >
        Build Tree
      </button>
      <div id="Tree">
        <svg width={width} height={height}>
          <g transform="translate(600, 125)">
            <g className="links"></g>
            <g className="nodes"></g>
          </g>
        </svg>
      </div>
    </div>
  );
}
