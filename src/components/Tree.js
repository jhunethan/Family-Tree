import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import "../css/Tree.css";
import Header from "./Header.js";
import NodeCard from "./NodeCard";

var height = 2000;
var width = 4000;

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0, //parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

export default function Tree() {
  const [update, setUpdate] = useState(false);
  const [tableData, setTableData] = useState();
  var treeData = [];

  useEffect(() => {
    Axios.get("https://layfamily.herokuapp.com/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  useEffect(() => {
    try {
      let buildcheck = document.getElementById("Tree").children;
      if (buildcheck.length < 1) {
        buildTree();
      }
    } catch {} // eslint-disable-next-line
  }, [tableData]);

  //triggers a data request
  const updateTree = () => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  //convert to hierarchal tree form using d3.stratify()
  const converttreeData = () => {
    treeData = tableData;
    let partners = treeData.filter((x) => x.isPartner === 1);
    treeData = treeData.filter((x) => x.isPartner !== 1);
    for (let i = 0; i < partners.length; i++) {
      //get name of parent node
      //make partner object an attribute of parent node (partnerinfo)
      for (let x = 0; x < treeData.length; x++) {
        if (treeData[x].id === partners[i].pid) {
          treeData[x].partnerinfo = partners[i];
        }
      }
    }

    treeData = d3
      .stratify()
      .id((d) => d["id"])
      .parentId((d) => d["pid"])(treeData);
  };

  const buildTree = () => {
    converttreeData();

    function zoomed({ transform }) {
      d3.select("svg").selectAll("g").attr("transform", transform);
    }

    var treeLayout = d3.tree();
    treeLayout.nodeSize([375, 250]);
    treeLayout(treeData);
    var linksData = treeData.links();

    var svg = d3.select("#Tree").append("svg");
    svg.attr("width", width).attr("height", height);

    var nodes = d3.select("svg").selectAll("g").data([0]);
    nodes.enter().append("g").attr("class", "links");
    nodes.enter().append("g").attr("class", "nodes");

    var links = d3.select("svg").selectAll("g").data([0]);

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.25, 1])
        .on("zoom", zoomed)
    );

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
        return d.y - 175;
      })
      .attr("rx", function (d) {
        return 5;
      })
      .attr("ry", function (d) {
        return 5;
      });

    var partnerRect = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());

    partnerRect
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partnernode level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 87.5;
      })
      .attr("y", function (d) {
        return d.y - 175;
      })
      .attr("rx", function (d) {
        return 5;
      })
      .attr("ry", function (d) {
        return 5;
      })
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.name === "text") return false;
        } catch {
          return true;
        }
      });

    var partnerText = d3
      .select("svg g.nodes")
      .selectAll("text .node")
      .data(treeData.descendants());
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 165.5;
      })
      .attr("y", function (d) {
        return d.y - 145;
      })
      .text(function (d) {
        try {
          return d.data.partnerinfo.birthdate;
        } catch {
          return "";
        }
      })
      .call(wrap, 150);
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 165.5;
      })
      .attr("y", function (d) {
        return d.y - 125;
      })
      .text(function (d) {
        try {
          return d.data.partnerinfo.name;
        } catch {
          return "";
        }
      })
      .call(wrap, 150);
    var text = d3
      .select("svg g.nodes")
      .selectAll("text .node")
      .data(treeData.descendants());
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 145;
      })
      .text(function (d) {
        return d.data.birthdate;
      })
      .call(wrap, 150);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 125;
      })
      .text(function (d) {
        return d.data.generation;
      })
      .call(wrap, 150);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 105;
      })
      .text(function (d) {
        return d.data.name;
      })
      .call(wrap, 100);

    links = d3.select("svg g.links").selectAll("path").data(linksData);
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
          " v 50 H" +
          d.target.x +
          " V" +
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
  };

  return (
    <div>
      <Header
        option1text={"Update Tree"}
        option1action={() => {
          updateTree();
        }}
      />
      <NodeCard data={tableData}/>
      <div id="Tree"></div>
    </div>
  );
}
