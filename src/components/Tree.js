import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import * as $ from "jquery";
import "../css/Tree.css";
import Header from "./Header.js";
import NodeCard from "./NodeCard";
import Modal from "./Modal";
import Edit from "./Edit";

var height;
var width;
var datalistarr,
  treeData = [];

export default function Tree() {
  const [update, setUpdate] = useState(false);
  const [tableData, setTableData] = useState();
  var [radiochecked, setRadiochecked] = useState(true);
  const [InfoCard, setInfoCard] = useState({
    id: "",
    name: "",
    generation: "",
    birthdate: "",
    parent: "",
  });

  const switchRadio = () => {
    setRadiochecked(!radiochecked);
  };

  useEffect(() => {
    Axios.get("http://localhost:5000/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  useEffect(() => {
    //if tabledata is updated, check if the tree exists, else do nothing
    var intervalId = setInterval(function () {
      if (!$("svg").children().length > 0) {
        try {
          buildTree();
        } catch {}
        clearInterval(intervalId);
      }
    }, 100);
    // eslint-disable-next-line
  }, [tableData]);

  //triggers a data request
  const updateTree = () => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  const closePopups = () => {
    // $("div.Create").css("display", "none");
    $("#editForm").css("display", "none");
    $("#deleteConfirmMenu").css("display", "none");
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

  function zoomed({ transform }) {
    d3.select("svg").selectAll("g").attr("transform", transform);
  }

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

  var zoom = d3
    .zoom()
    .extent([
      [0, 0],
      [$("#Tree").width(), $("#Tree").height()],
    ])
    .scaleExtent([0.25, 1])
    .on("zoom", zoomed);

  var svg = d3.select("#Tree").append("svg");

  const buildTree = () => {
    converttreeData();
    height = $("#Tree").height();
    width = $("#Tree").width();
    console.log(height, width);

    var treeLayout = d3.tree();
    treeLayout.nodeSize([375, 250]);
    treeLayout(treeData);
    var linksData = treeData.links();

    svg.attr("width", width).attr("height", height).call(zoom);

    var nodes = d3.select("svg").selectAll("g").data([0]);
    nodes.enter().append("g").attr("class", "links");
    nodes.enter().append("g").attr("class", "nodes");

    var links = d3.select("svg").selectAll("g").data([0]);

    // Nodes
    var shapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());
    shapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "node level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 75;
      })
      .attr("y", function (d) {
        return d.y - 180;
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .on("click", function (d) {
        $("#card-container").css("display", "block");
        zoom.scaleTo(svg.transition().duration(250), 1);
        setInfoCard({
          id: d.target.__data__.data.id,
          name: d.target.__data__.data.name,
          generation: d.target.__data__.data.generation,
          birthdate: d.target.__data__.data.birthdate,
        });
        zoom.translateTo(
          svg.transition().duration(250),
          d.target.__data__.x + width / 3.2,
          d.target.__data__.y + height / 4
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 250);
      });

    shapes
      .enter()
      .append("circle")
      .attr("r", 50)
      .attr("class", function (d) {
        return "circle level-" + d.depth;
      })
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y - 180;
      });

    var partnerShapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());

    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partnernode level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 87.5;
      })
      .attr("y", function (d) {
        return d.y - 180;
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.name === "text") return false;
        } catch {
          return true;
        }
      })
      .on("click", function (d) {
        zoom.scaleTo(svg.transition().duration(250), 1);
        $("#card-container").css("display", "block");
        setInfoCard({
          id: d.target.__data__.data.partnerinfo.id,
          name: d.target.__data__.data.partnerinfo.name,
          generation: d.target.__data__.data.partnerinfo.generation,
          birthdate: d.target.__data__.data.partnerinfo.birthdate,
        });
        console.log(d.target.__data__.x);
        zoom.translateTo(
          svg.transition().duration(250),
          d.target.__data__.x + width / 3.2,
          d.target.__data__.y + height / 4
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 250);
      });
    partnerShapes
      .enter()
      .append("circle")
      .attr("r", 50)
      .attr("class", function (d) {
        return "circle level-" + d.depth;
      })
      .attr("cx", function (d) {
        return d.x + 165;
      })
      .attr("cy", function (d) {
        return d.y - 180;
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
        return d.x + 162.5;
      })
      .attr("y", function (d) {
        return d.y - 100;
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
        return d.x + 162.5;
      })
      .attr("y", function (d) {
        return d.y - 75;
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
        return d.y - 100;
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
        return d.y - 75;
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
        return d.y - 50;
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

  const populateDatalist = () => {
    $("#datalist-input").css("border", "1px solid black");
    let str = "";
    datalistarr = [];
    let list = document.getElementById("datalist-ul");
    //populate parentSearchDataList
    for (const x of tableData) {
      if (x.id !== 0)
        datalistarr.push(`${x.generation} ${x.name} ${x.birthdate} ${x.id}`);
    }
    for (var i = 0; i < datalistarr.length; ++i) {
      str += '<option value="' + datalistarr[i] + '" />';
    }
    list.innerHTML = str;
  };

  const getPID = (nameKey) => {
    let node;
    for (var i = 0; i < tableData.length; i++) {
      let namecheck = tableData[i].generation + " " + tableData[i].name;
      if (namecheck === nameKey) {
        node = tableData[i];
      }
    }
    return node.id;
  };

  const search = () => {
    let found = false;
    let node;
    let searchterm = $.trim($("#datalist-input").val());
    $("#datalist-input").val("");
    populateDatalist();

    for (const x of datalistarr) {
      if (searchterm === $.trim(x)) {
        found = true;
      }
    }
    if (found) {
      //get node object
      let n = searchterm.split(" ");
      let id = Number(n[n.length - 1]);
      for (const x of tableData) {
        if (x.id === id) {
          node = x;
        }
      }
      $("#card-container").css("display", "block");
      let nodeRect = d3.select("svg g.nodes").selectAll("text")._groups[0];
      let dimensions = [];
      for (const x of nodeRect) {
        if (x.__data__.data.name === node.name) {
          dimensions[0] = x.__data__.x;
          dimensions[1] = x.__data__.y;
        } else {
          try {
            if (x.__data__.data.partnerinfo.name === node.name) {
              dimensions[0] = x.__data__.x + 100;
              dimensions[1] = x.__data__.y;
            }
          } catch {}
        }
      }
      console.log(nodeRect);
      try {
        setInfoCard({
          id: node.id,
          name: node.name,
          generation: node.generation,
          birthdate: node.birthdate,
        });
        zoom.scaleTo(svg.transition().duration(250), 1);
        $("#card-container").css("display", "block");
        zoom.translateTo(
          svg.transition().duration(250),
          dimensions[0] + width / 3.2,
          dimensions[1] + height / 4
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 250);
      } catch (error) {
        console.log(error);
      }
      return true;
    } else {
      $("#datalist-input").css("border", "2px solid red");
      $("#datalist-input").attr("placeholder", "Please click from list");
      return false;
    }
  };

  const populateEditFields = (node) => {
    $("#genInput").val(node.generation);
    $("#name").val(node.name);
    $("#birthdate").val(node.birthdate);

    let pval = node.isPartner ? node.partner : node.parent;
    $("#parentInput").val(pval);
  };

  const openNode = () => {
    $("#parentInput").css("border-bottom", "2px solid #bebed2");
    $("#parentInput").val("");
    $("#parentInput").attr("placeholder", "Parent/Partner");
    let node;
    // let str = "";
    // let datalistarr = [];
    // let data = tableData;
    // let list = document.getElementById("parentSearchDataList");

    // //populate parentSearchDataList
    // for (const x of data) {
    //   datalistarr.push(`${x.generation} ${x.name}`);
    //   if (x.id === Number(id)) node = x;
    // }
    // for (var i = 0; i < datalistarr.length; ++i) {
    //   str += '<option value="' + datalistarr[i] + '" />';
    // }
    // list.innerHTML = str;

    for (let i = 0; i < tableData.length; i++) {
      if (InfoCard.id === tableData[i].id) node = tableData[i];
    }

    console.log(node);
    node.isPartner ? setRadiochecked(false) : setRadiochecked(true);

    //sort out edit menu
    populateEditFields(node);
    $("#editForm").css("display", "block");
    $("#Modal").css("display", "block");
  };

  return (
    <div>
      <Header
        option1text={"Update Tree"}
        option1action={() => {
          updateTree();
        }}
      />
      <div className="datalist">
        <input
          id="datalist-input"
          className="datalist-input"
          type="text"
          name="searchtree"
          placeholder="Search Here"
          list="datalist-ul"
          onClick={() => {
            populateDatalist();
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element if successful
              if (search()) event.target.blur();
            }
          }}
        />
        <button
          id="datalistbutton"
          onClick={(event) => {
            if (!search()) document.getElementById("datalist-input").focus();
          }}
        >
          Search
        </button>
        <datalist id="datalist-ul" className="datalist-ul"></datalist>
      </div>
      <NodeCard
        InfoCardname={InfoCard.name}
        InfoCardbirthdate={InfoCard.birthdate}
        InfoCardgeneration={InfoCard.generation}
        edit={() => openNode()}
      />
      <div id="Tree"></div>
      <Edit
        getPID={getPID}
        radiochecked={radiochecked}
        switchRadio={switchRadio}
        data={tableData}
        nodedata={InfoCard}
        update={() => {
          updateTree();
        }}
      />
      <Modal close={closePopups} />
    </div>
  );
}
