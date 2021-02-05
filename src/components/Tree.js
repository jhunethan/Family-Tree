import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import * as $ from "jquery";
import "../css/Tree.css";

import NodeCard from "./NodeCard";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";
import EditExtra from "./EditExtra";

var height;
var width;
var datalistarr,
  treeData = [];

export default function Tree() {
  const [update, setUpdate] = useState(false);
  const [datalist, setDatalist] = useState([]);
  const [tableData, setTableData] = useState([]);
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
    //clear tree
    $("#Tree").html("");
    //if tabledata is updated, check if the tree exists, else do nothing
    var intervalId = setInterval(function () {
      if ($("#Tree").children().length < 1) {
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
    $("div.Create").css("display", "none");
    $("#editForm").css("display", "none");
    $("#deleteConfirmMenu").css("display", "none");
    $("div.edit-container").css("display", "none");
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
    .scaleExtent([0.1, 1])
    .on("zoom", zoomed);

  var svg = d3.select("#Tree")

  const buildTree = () => {
    //reconvert tabledata to check for updates
    converttreeData();

    Axios.get("http://localhost:5000/api/get/extra").then((result) => {
      let extradetails = result.data;
      let tempData = tableData;

      for (let i = 0; i < tempData.length; i++) {
        for (const x of extradetails) {
          if (x.id === tempData[i].id) {
            tempData[i].extradetails = x;
          }
        }
      }
      setTableData(tempData);
    });

    height = $("#Tree").height();
    width = $("#Tree").width();

    svg = d3.select("#Tree").append("svg");

    var treeLayout = d3.tree();
    treeLayout.nodeSize([750, 350]);
    treeLayout(treeData);
    var linksData = treeData.links();

    svg.attr("width", width).attr("height", height).call(zoom);

    var nodes = d3.select("svg").selectAll("g").data([0]);
    nodes.enter().append("g").attr("class", "links");
    nodes.enter().append("g").attr("class", "nodes");

    var links = d3.select("svg").selectAll("g").data([0]);

    //partnernodes
    var partnerShapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());
    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partner-container shadow level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 390;
      })
      .attr("y", function (d) {
        return d.y - 170;
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.isPartner === 1) return false;
        } catch {
          return true;
        }
      });

    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partner-container level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 400;
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
      });
    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partnernode level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 50;
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
        zoom.scaleTo(svg.transition().duration(500), 0.25);
        $("#card-container").css("display", "block");
        setInfoCard(d.target.__data__.data.partnerinfo);
        zoom.translateTo(
          svg.transition().duration(500),
          d.target.__data__.x,
          d.target.__data__.y
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 500);
      });

    partnerShapes
      .enter()
      .append("circle")
      .attr("r", 50)
      .attr("class", function (d) {
        return "circle level-" + d.depth;
      })
      .attr("cx", function (d) {
        return d.x + 145;
      })
      .attr("cy", function (d) {
        return d.y - 90;
      })
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.name === "text") return false;
        } catch {
          return true;
        }
      });

    // Nodes
    var shapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());
    //normal node shadow
    shapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "node shadow level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 180;
      })
      .attr("y", function (d) {
        return d.y - 170;
      })
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.name !== "") return true;
        } catch {
          return false;
        }
      });
    //normal node rectangle
    shapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "node level-" + d.depth;
      })
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 400;
        } catch {
          return d.x - 190;
        }
      })
      .attr("y", function (d) {
        return d.y - 180;
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .on("click", function (d) {
        $("#card-container").css("display", "block");
        zoom.scaleTo(svg.transition().duration(500), 0.25);
        setInfoCard(d.target.__data__.data);
        zoom.translateTo(
          svg.transition().duration(500),
          d.target.__data__.x,
          d.target.__data__.y
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 500);
      });

    shapes
      .enter()
      .append("circle")
      .attr("r", 50)
      .attr("class", function (d) {
        return "circle level-" + d.depth;
      })
      .attr("cx", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 290;
        } catch {
          return d.x - 90;
        }
      })
      .attr("cy", function (d) {
        return d.y - 90;
      });

    var partnerText = d3
      .select("svg g.nodes")
      .selectAll("text .node")
      .data(treeData.descendants());
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 290;
      })
      .attr("y", function (d) {
        return d.y - 120;
      })
      .text(function (d) {
        try {
          return d.data.partnerinfo.birthdate;
        } catch {
          return "";
        }
      })
      .call(wrap, 200);
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 290;
      })
      .attr("y", function (d) {
        return d.y - 70;
      })
      .text(function (d) {
        try {
          return d.data.partnerinfo.name;
        } catch {
          return "";
        }
      })
      .call(wrap, 200);
    var text = d3
      .select("svg g.nodes")
      .selectAll("text .node")
      .data(treeData.descendants());
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 150;
        } catch {
          return d.x + 40;
        }
      })
      .attr("y", function (d) {
        return d.y - 120;
      })
      .text(function (d) {
        return d.data.birthdate;
      })
      .call(wrap, 200);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 150;
        } catch {
          return d.x + 40;
        }
      })
      .attr("y", function (d) {
        return d.y - 95;
      })
      .text(function (d) {
        return d.data.generation;
      })
      .call(wrap, 200);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 150;
        } catch {
          return d.x + 40;
        }
      })
      .attr("y", function (d) {
        return d.y - 70;
      })
      .text(function (d) {
        return d.data.name;
      })
      .call(wrap, 200);

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
              dimensions[0] = x.__data__.x;
              dimensions[1] = x.__data__.y;
            }
          } catch {}
        }
      }
      try {
        setInfoCard({
          id: node.id,
          name: node.name,
          generation: node.generation,
          birthdate: node.birthdate,
          parent: node.parent,
        });
        zoom.scaleTo(svg.transition().duration(500), 0.25);
        $("#card-container").css("display", "block");
        zoom.translateTo(
          svg.transition().duration(500),
          dimensions[0],
          dimensions[1]
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 1);
        }, 500);
      } catch {}
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

  const removeChildren = (id, arr) => {
    let children = arr.filter((x) => {
      return x.pid === Number(id);
    });
    arr = arr.filter((x) => {
      return x.pid !== Number(id);
    });
    try {
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          arr = removeChildren(children[i].id, arr);
        }
      }
    } catch {}
    return arr;
  };

  const openNode = () => {
    $("#parentInput").css("border-bottom", "2px solid #bebed2");
    $("#parentInput").val("");
    $("#parentInput").attr("placeholder", "Parent/Partner");
    let node;
    let str,
      id = "";
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    let temparr = tableData;
    try {
      if (InfoCard.isPartner === 1) {
        id = null;
        for (let i = 0; i < tableData.length; i++) {
          let name = `${tableData[i].generation} ${tableData[i].name}`;
          if (InfoCard.partner === name) {
            id = tableData[i].id;
          } else {
            if (InfoCard.partner === tableData[i].name) id = tableData[i].id;
          }
        }
      } else id = InfoCard.id;
    } catch {
      id = InfoCard.id;
    }
    temparr = removeChildren(id, temparr);
    setDatalist(temparr);
    for (var i = 0; i < temparr.length; ++i) {
      str +=
        '<option value="' +
        temparr[i].generation +
        " " +
        temparr[i].name +
        '" />';
    }
    list.innerHTML = str;

    for (let i = 0; i < tableData.length; i++) {
      if (InfoCard.id === tableData[i].id) node = tableData[i];
    }

    node.isPartner ? setRadiochecked(false) : setRadiochecked(true);

    //sort out edit menu
    populateEditFields(node);
    $("#editForm").css("display", "block");
    $("#Modal").css("display", "block");
    $("div.edit-container").css("display", "flex");
  };

  const resetCreateFields = () => {
    let str = "";
    let temparr = [];
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    for (const x of tableData) {
      temparr.push(`${x.generation} ${x.name}`);
    }
    for (var i = 0; i < temparr.length; ++i) {
      str += '<option value="' + temparr[i] + '" />';
    }
    list.innerHTML = str;
    try {
      $("#toggle-slide").checked = false;
      $("div.Create").css("display", "block");
      $("#Modal").css("display", "block");
      $("#nameInputC")
        .attr("placeholder", "")
        .val("")
        .css("border-bottom", "2px solid #bebed2");
      $("#genInputC").val("");
      $("#birthdateInputC").val("");
      $("#parentInputC")
        .val("")
        .css("border-bottom", "2px solid #bebed2")
        .attr("placeholder", "");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="datalist">
        <input
          id="datalist-input"
          className="datalist-input"
          type="text"
          name="searchtree"
          placeholder="Search by Name or Birthdate"
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
      <button className="create-button" onClick={() => resetCreateFields()}>
        Add New
      </button>
      <button className="refresh-button" onClick={() => updateTree()}>
        ⟳
      </button>
      <NodeCard node={InfoCard} treeData={tableData} edit={() => openNode()} />
      <div id="Tree"></div>
      <Create
        data={tableData}
        getPID={getPID}
        update={() => {
          updateTree();
        }}
      />
      <Edit
        getPID={getPID}
        radiochecked={radiochecked}
        switchRadio={switchRadio}
        data={tableData}
        datalist={datalist}
        nodedata={InfoCard}
        update={() => {
          updateTree();
        }}
      />
      <EditExtra currentNode={InfoCard} />
      <Modal close={closePopups} />
    </div>
  );
}
