import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import * as $ from "jquery";
import "../css/Tree.css";
import "dateformat";
import pattern from "../css/pattern.jpg";
import profile from "../css/person-placeholder.jpg";

import NodeCard from "./NodeCard";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";

var height;
var width;
var datalistarr,
  treeData = [];

// function treeCard(data) {
//   return (
//     <div className="node">
//       <section className="pattern">pattern</section>
//       <div className="profile-picture"></div>
//       <section className="tree-card-main">
//         <div className="tree-card-birth card-birthdate">28th December 2001</div>
//         <div className="tree-card-birth card-age">19 years old</div>
//         <div className="card-name">
//           <p className="sub">Hau</p>
//           <p>Jhun Ethan Lay</p>
//         </div>
//         <div className="tree-card-footer">Carpenter</div>
//       </section>
//     </div>
//   );
// }

export default function Tree(props) {
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

  var dateFormat = require("dateformat");

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
      if ($("#Tree").children().length === 0) {
        $("#Tree").html("");
        try {
          buildTree();
        } catch {}
        clearInterval(intervalId);
      }
    }, 200);
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

  var svg = d3.select("#Tree");

  const buildTree = () => {
    //reconvert tabledata to check for updates
    converttreeData();

    height = $("#Tree").height();
    width = $("#Tree").width();

    svg = d3.select("#Tree").call(zoom);
    zoom.scaleTo(svg.transition().duration(500), 0.25);
    var treeLayout = d3.tree();
    treeLayout.nodeSize([1400, 570]);
    treeLayout(treeData);
    var linksData = treeData.links();

    svg
      .append("svg")
      .classed("svg-container", true)
      .attr("width", width)
      .attr("height", height);

    // initial zoom
    var nodes = d3.select("svg.svg-container").selectAll("g").data([0]);
    nodes.enter().append("g").attr("class", "links");
    nodes.enter().append("g").attr("class", "nodes");

    var links = d3.select("svg").selectAll("g").data([0]);

    //partnernodes
    var partnerShapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(
        treeData.descendants().filter(function (d) {
          try {
            if (d.data.partnerinfo.name) return true;
          } catch {}
          return false;
        })
      );

    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partner-container level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x - 525;
      })
      .attr("y", function (d) {
        return d.y - 450;
      })
      .attr("fill", "#FED381")
      .attr("rx", 5)
      .attr("ry", 5);

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
        return d.y - 400;
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
          zoom.scaleTo(svg.transition().duration(750), 0.5);
        }, 500);
      });
    partnerShapes
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "partner pattern level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 50;
      })
      .attr("y", function (d) {
        return d.y - 400;
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
    //card pattern
    partnerShapes
      .enter()
      .append("image")
      .attr("xlink:href", pattern)
      .attr("class", function (d) {
        return "pattern level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 47.5;
      })
      .attr("y", function (d) {
        return d.y - 400;
      });
    partnerShapes
      .enter()
      .append("foreignObject")
      .attr("class", function (d) {
        return "profile-container level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 275;
      })
      .attr("y", function (d) {
        return d.y - 362.5;
      })
      .append("xhtml:img")
      .attr("src", profile)
      .classed("profile-picture", true);
    // Nodes
    var shapes = d3
      .select("svg g.nodes")
      .selectAll("rect .node")
      .data(treeData.descendants());

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
          return d.x - 662.5;
        } catch {
          return d.x - 300;
        }
      })
      .attr("y", function (d) {
        return d.y - 400;
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
          zoom.scaleTo(svg.transition().duration(750), 0.5);
        }, 500);
      });

    //card pattern
    shapes
      .enter()
      .append("image")
      .attr("xlink:href", pattern)
      .attr("class", function (d) {
        return "node pattern level-" + d.depth;
      })
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 662.5;
        } catch {
          return d.x - 300;
        }
      })
      .attr("y", function (d) {
        return d.y - 400;
      });

    shapes
      .enter()
      .append("foreignObject")
      .attr("class", function (d) {
        return "profile-container level-" + d.depth;
      })
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 450;
        } catch {
          return d.x - 75;
        }
      })
      .attr("y", function (d) {
        return d.y - 362.5;
      })
      .append("xhtml:img")
      .attr("src", profile)
      .classed("profile-picture", true);

    var partnerText = d3
      .select("svg g.nodes")
      .selectAll("text .node")
      .data(
        treeData.descendants().filter(function (d) {
          try {
            if (d.data.partnerinfo.name) return true;
          } catch {}
          return false;
        })
      );
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 167.5;
      })
      .attr("y", function (d) {
        return d.y - 250;
      })
      .text(function (d) {
        try {
          if (d.data.partnerinfo.birthdate)
            return dateFormat(d.data.partnerinfo.birthdate, "dS mmmm yyyy");
        } catch {}
        return "";
      })
      .call(wrap, 200);
    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 562.5;
      })
      .attr("y", function (d) {
        return d.y - 250;
      })
      .text(function (d) {
        try {
          if (d.data.partnerinfo.birthdate) {
            let firstDate = new Date(d.data.partnerinfo.birthdate),
              now = new Date(),
              timeDifference = Math.floor(
                Math.abs((now.getTime() - firstDate.getTime()) / 31449600000)
              );
            return `${timeDifference} years old`;
          }
        } catch {}
        return "";
      })
      .call(wrap, 200);

    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x + 350;
      })
      .attr("y", function (d) {
        return d.y - 100;
      })
      .text(function (d) {
        try {
          return d.data.partnerinfo.name;
        } catch {
          return "";
        }
      })
      .classed("name-field", true)
      .call(wrap, 400);

    partnerText
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 412.5;
      })
      .text(function (d) {
        return "Married: YYYY";
      })
      .classed("name-field", true)
      .call(wrap, 400);
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
          return d.x - 550;
        } catch {
          return d.x - 187.5;
        }
      })
      .attr("y", function (d) {
        return d.y - 250;
      })
      .text(function (d) {
        if (d.data.birthdate)
          return dateFormat(d.data.birthdate, "dS mmmm yyyy");
        return "";
      })
      .call(wrap, 200);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 165;
        } catch {
          return d.x + 200;
        }
      })
      .attr("y", function (d) {
        return d.y - 250;
      })
      .text(function (d) {
        if (d.data.deathdate) {
          return dateFormat(d.data.deathdate, "dS mmmm yyyy");
        }
        if (d.data.birthdate) {
          let firstDate = new Date(d.data.birthdate),
            now = new Date(),
            timeDifference = Math.floor(
              Math.abs((now.getTime() - firstDate.getTime()) / 31449600000)
            );
          return `${timeDifference} years old`;
        }
        return "";
      })
      .call(wrap, 200);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 375;
        } catch {
          return d.x;
        }
      })
      .attr("y", function (d) {
        return d.y - 140;
      })
      .text(function (d) {
        return d.data.generation;
      })
      .call(wrap, 300);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 375;
        } catch {
          return d.x;
        }
      })
      .attr("y", function (d) {
        return d.y - 100;
      })
      .text(function (d) {
        return d.data.name;
      })
      .classed("name-field", true)
      .call(wrap, 400);
    text
      .enter()
      .append("text")
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 80;
        } catch {
          return d.x + 280;
        }
      })
      .attr("y", function (d) {
        return d.y - 10;
      })
      .text(function (d) {
        try {
          return d.data.extradetails.profession;
        } catch {
          return "";
        }
      })
      .classed("profession", true);

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
    $("#datalist-input").attr("placeholder", "Search by Name or Birthdate");

    let str = "";
    datalistarr = [];
    let list = $("ul.datalist-ul");
    //populate parentSearchDataList
    for (const x of tableData) {
      if (x.id !== 0)
        datalistarr.push(`${x.generation} ${x.name} ${x.birthdate} ${x.id}`);
    }

    if ($("#datalist-input").val()) {
      let parsed = $.trim($("#datalist-input").val().toLowerCase()).split(" ");
      datalistarr = datalistarr.filter((x) => {
        for (const word of parsed) {
          if (!x.toLowerCase().includes(word)) return false;
        }
        return true;
      });
    }

    for (var i = 0; i < datalistarr.length; ++i) {
      str += `<li>${datalistarr[i]}</>`;
    }
    list.html(str);

    if (datalistarr.length === 0 && $.trim($("#datalist-input").val())) {
      list.html(`<li>No results.</li>`);
    }
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

  const search = (text, method) => {
    let found = false;
    let node, searchterm;
    if (method === "first") {
      try {
        searchterm = $.trim($("ul.datalist-ul")[0].firstChild.textContent);
      } catch {}
    } else {
      searchterm = $.trim(text);
    }
    $("#datalist-input")
      .val("")
      .attr("placeholder", "Search by Name or Birthdate");
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
      let tempData = tableData;
      for (const x of tempData) {
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
        setInfoCard(node);
        zoom.scaleTo(svg.transition().duration(500), 0.25);
        $("ul.datalist-ul").html("");
        $("#card-container").css("display", "block");
        zoom.translateTo(
          svg.transition().duration(500),
          dimensions[0],
          dimensions[1]
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 0.5);
        }, 500);
      } catch {}
      return true;
    } else {
      $("#datalist-input").css("border", "2px solid red");
      $("#datalist-input").attr("placeholder", "Person not found.");
      return false;
    }
  };

  const populateEditFields = (node) => {
    $("#genInput").val(node.generation);
    $("#name").val(node.name);
    $("#birthdate").val(node.birthdate);

    if (node.deathdate) {
      $("#isDeceased").attr("checked", true);
      $("#deathdate").css("display", "block").val(node.deathdate);
    } else {
      $("#isDeceased").attr("checked", false);
      $("#deathdate").css("display", "none");
    }
    let pval = node.isPartner ? node.partner : node.parent;
    $("#parentInput").val(pval);

    try {
      $("#birthplace-input").val(node.extradetails.birthplace);
      $("#location-input").val(node.extradetails.location);
      $("#extranames-input").val(node.extradetails.extranames);
      $("#fblink-input").val(node.extradetails.fblink);
      $("#profession-input").val(node.extradetails.profession);
      $("textarea.description-input").val(node.extradetails.description);
    } catch {
      $("#birthplace-input").val("");
      $("#location-input").val("");
      $("#extranames-input").val("");
      $("#fblink-input").val("");
      $("#profession-input").val("");
      $("textarea.description-input").val("");
    }
  };

  const removeChildren = (id, arr) => {
    let children = arr.filter((x) => {
      return x.pid === Number(id);
    });
    arr = arr.filter((x) => {
      return x.pid !== Number(id);
    });
    arr = arr.filter((x) => {
      return x.isPartner !== 1;
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
    } catch {}
  };

  $("ul.header-navigation").removeClass("hidden");
  $(window).on("click", function (event) {
    //Hide the menus if visible
    try {
      if (event.target !== $("#datalist-input")[0]) {
        $("ul.datalist-ul").html("");
      }
    } catch {}
  });

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
          onChange={() => {
            populateDatalist();
          }}
          onClick={() => {
            populateDatalist();
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element if successful
              let val = $("#datalist-input").val();
              if (search(val, "first")) event.target.blur();
            }
          }}
        />
        <button
          id="datalistbutton"
          onClick={(event) => {
            if (!search($("#datalist-input").val(), "first"))
              return document.getElementById("datalist-input").focus();
          }}
        >
          Search
        </button>
      </div>
      <ul
        className="datalist-ul"
        onClick={(e) => {
          try {
            search(e.target.closest("li").textContent);
          } catch {}
        }}
      ></ul>
      <button className="create-button" onClick={() => resetCreateFields()}>
        Add New
      </button>
      <button className="refresh-button" onClick={() => updateTree()}>
        Read
      </button>
      <NodeCard
        update={() => updateTree()}
        node={InfoCard}
        treeData={tableData}
        edit={() => openNode()}
      />
      <svg id="Tree"></svg>
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
      <Modal close={closePopups} />
    </div>
  );
}
