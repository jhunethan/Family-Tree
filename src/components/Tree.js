import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import * as $ from "jquery";
import "../css/Tree.css";
import "dateformat";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [cookies] = useCookies(["author"]);
  const [update, setUpdate] = useState(false);
  const [datalist, setDatalist] = useState([]);
  const [tableData, setTableData] = useState([]);
  var [radiochecked, setRadiochecked] = useState(true);
  const [editview, seteditView] = useState(false);
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

  const changeView = () => {
    seteditView((prev) => !prev);
    if (editview) {
      $("foreignObject.edit-menu-container").remove();
      toast.info("Read Mode");
      return ($("button.changeview-button")[0].textContent = "Read");
    }
    $("button.changeview-button")[0].textContent = "Edit";
    $("#card-container").css("display", "none");
    toast.info("Edit mode, click any node to edit");
  };

  useEffect(() => {
    Axios.get("http://localhost:5000/api/get")
      .then((result) => {
        setTableData(result.data);
      })
      .then(() =>
        toast.success("Tree loaded!\n Try zooming out or use the search bar", {
          position: "top-center",
          autoClose: 10000,
        })
      );
  }, [update]);

  //update tree on tableData mutation
  useEffect(() => {
    $("#Tree").html("");
    var intervalId = setInterval(function () {
      if ($("#Tree").children().length === 0) {
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

  const getNode = (idKey) => {
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].id === idKey) {
        return tableData[i];
      }
    }
  };

  const normalise = (text) => {
    text = text.toLowerCase();
    return $.trim(text).replace(/\w\S*/g, (w) =>
      w.replace(/^\w/, (c) => c.toUpperCase())
    );
  };

  async function dynamicUpdate(obj) {
    console.log(obj);
    let data = tableData;

    if (!obj) {
      await setTableData([]);
      await setTableData(data);
      return;
    }

    //update an edited node
    switch (obj.method) {
      case "delete":
        data = data.filter((x) => x.id !== obj.id);
        for (let i = 0; i < data.length; i++) {
          if (data[i.pid === obj.id]) data[i].pid = 0;
          if (obj.isPartner) {
            if (data[i].id === obj.pid) data[i].partnerinfo = undefined;
          }
        }
        toast.success(`Removed ${obj.name}`);
        break;
      case "create":
        for (let i = 0; i < data.length; i++) {
          if (obj.id === data[i].id) return false;
          if (obj.isPartner) {
            if (data[i].id === obj.pid) data[i].partnerinfo = obj;
          }
        }
        obj.method = undefined;
        data.push(obj);
        if (obj.name) toast.success(`Added ${obj.name}`);
        break;
      default:
        for (let i = 0; i < data.length; i++) {
          if (data[i].id === obj.id) data[i] = obj;
          if (obj.isPartner) {
            if (data[i].id === obj.pid) data[i].partnerinfo = obj;
          } else
            try {
              if (data[i].partnerinfo.id === obj.id)
                data[i].partnerinfo = undefined;
              for (let x = 0; x < data.length; x++) {
                if (data[x].oldpid === obj.id) data[x].pid = obj.id;
              }
            } catch {}
        }
        toast.success(`Changes made to ${obj.name}`);
        break;
    }
    await setTableData([]);
    setTimeout(() => {
      setTableData(data);
    }, 150);
    if (obj.method !== "delete")
      setTimeout(() => {
        search(`${obj.id}`);
      }, 500);
  }

  const closePopups = () => {
    $("div.Create").css("display", "none");
    $("#editForm").css("display", "none");
    $("#deleteConfirmMenu").css("display", "none");
    $("div.edit-container").css("display", "none");
    $("foreignObject.edit-menu-container").remove();
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
        //if partner has children add it to partner's children list
        if (treeData[x].pid === partners[i].id) {
          treeData[x].pid = partners[i].pid;
          treeData[x].oldpid = partners[i].id;
        }
      }
    }

    //ensure that id === 0 is the root node
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i].id === 0) treeData[i].pid = null;
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
    .scaleExtent([0.05, 0.5])
    .on("zoom", zoomed);

  var svg = d3.select("#Tree");

  function editName(el) {
    let name = normalise($("input.edit-menu-input").val());
    let newData =
      el.classList[0] === "partnernode"
        ? el.__data__.data.partnerinfo
        : el.__data__.data;
    if (!name || name === newData.name) return closePopups();
    if (newData.name === "" && name) {
      newData.name = name;
      Axios.post("http://localhost:5000/api/insert", {
        input: newData,
        author: cookies.author,
      });
      toast.success(`${name} added to tree`);
      dynamicUpdate(newData);
    } else if (name !== newData.name && name) {
      //save
      newData.name = name;

      Axios.post("http://localhost:5000/api/update", {
        input: newData,
        name: newData.name,
        author: cookies.author,
        changes: "name",
      });
      toast.success(`Name updated to ${name}`);
      dynamicUpdate(newData);
    }
  }

  function addParent(child, parent, partner) {
    //delete parent

    if (parent === "delete") {
      let obj = child.__data__.data;

      if (partner) {
        obj = obj.partnerinfo;
      }

      obj.pid = 0;
      obj.parent = "";
      obj.partner = "";
      obj.isPartner = 0;
      Axios.post("http://localhost:5000/api/update", {
        input: obj,
        name: obj.name,
        author: cookies.author,
        changes: "removed parent",
      });
      dynamicUpdate(obj);
      return;
    }

    if (partner) {
      if (parent.id !== child.__data__.data.id) {
        if (child.__data__.data.name) {
          let obj = child.__data__.data;

          obj.pid = parent.id;
          obj.parent = "";
          obj.partner = parent.name;
          obj.isPartner = 1;
          Axios.post("http://localhost:5000/api/update", {
            input: obj,
            name: obj.name,
            author: cookies.author,
            changes: "set parent",
          });
          dynamicUpdate(obj);
        } else {
          toast.error("Please set name before setting as partner");
        }
      } else {
        toast.error("Invalid partner, try again");
        nodeClick(child);
      }

      return;
    }

    //make sure parent is valid
    let arr = filterChildren(Number(child.__data__.data.id), tableData);

    if (arr.includes(parent)) {
      let obj = child.__data__.data;
      obj.pid = Number(parent.id);
      obj.parent = parent.name;

      Axios.post("http://localhost:5000/api/update", {
        input: obj,
        name: obj.name,
        author: cookies.author,
        changes: "changed parent",
      });
      dynamicUpdate(obj);
    } else {
      toast.error("Invalid parent, try again");
      nodeClick(child);
    }
  }

  function addNode(el, method) {
    //new child
    let node;
    switch (method) {
      case "child":
        node = el.__data__;
        toast.success(`Child Added to ${node.data.name}`);
        break;
      case "sibling":
        node = el.__data__.parent;
        toast.success(`Child Added to ${node.data.name}`);
        break;
      default:
        node = el.__data__;
        break;
    }
    //set unique insert ID
    let idArray = [],
      id = 1;

    for (let i = 0; i < tableData.length; i++) {
      idArray.push(tableData[i].id);
    }
    while (idArray.includes(id)) id += 1;
    //new child default values
    let newChild = {
      id: id,
      birthdate: "",
      generation: "",
      name: "",
      deathdate: null,
      pid: node.data.id,
      isPartner: 0,
      parent: node.data.name,
      method: "create",
    };
    dynamicUpdate(newChild);
  }

  function nodeClick(el, type) {
    let child =
      el.classList[0] === "partnernode"
        ? el.__data__.data.partnerinfo
        : el.__data__.data;
    setInfoCard(child);
    //alternative function
    //show a edit menu for a node letting the user change the tree dynamically
    if ($("button.changeview-button")[0].textContent === "Edit") {
      //remove other instances of edit menus
      $("foreignObject.edit-menu-container").remove();
      //open edit menu
      d3.select("g.nodes")
        .append("foreignObject")
        .attr("class", "edit-menu-container")
        .attr("x", function () {
          if (child.isPartner) return el.__data__.x - 352.5;
          if (child.partnerinfo) {
            return el.__data__.x - 1062.5;
          }
          return el.__data__.x - 700;
        })
        .attr("y", el.__data__.y - 800)
        .attr("height", "1200px")
        .attr("width", "1400px");

      let menu = d3
        .select("foreignObject.edit-menu-container")
        .append("xhtml:div")
        .attr("class", "edit-menu")
        .call(d3.zoom());

      menu
        .append("input")
        .attr("value", child.name)
        .attr("class", "edit-menu-input")
        .attr("placeholder", "full name");
      let nav = menu.append("div").attr("class", "edit-menu-nav");

      nav
        .append("button")
        .text("cancel")
        .on("click", () => {
          if (!child.name) {
            let obj = child;
            obj.method = "delete";
            dynamicUpdate(obj);
          }
          closePopups();
        });
      nav
        .append("button")
        .text("save")
        .on("click", () => {
          editName(el);
        });

      //buttons
      if (child.parent || child.partner)
        menu
          .append("button")
          .attr("class", "edit-menu-button delete-parent")
          .text("detach parent")
          .on("click", () => {
            addParent(el, "delete", child.isPartner);
          });

      menu
        .append("button")
        .text("edit details")
        .attr("class", "edit-menu-button edit-menu-details")
        .on("click", () => {
          if (child.name) return openNode(child);
          if ($("input.edit-menu-input").val()) {
            editName(el);
            return openNode(child);
          }
          toast.error("Set name before editing this person.");
        });

      menu
        .append("button")
        .attr("class", "edit-menu-button partner")
        .text("set partner")
        .on("click", () => {
          editName(el);
          toast.info(`Click person to set as partner`, {
            autoClose: false,
            position: "top-right",
            toastId: "selectError",
          });
          //add listener for next click
          $(window).on("click", function (event) {
            let classes = event.target.classList;
            if (classes[0] !== "edit-menu-button") {
              if (event.target.classList[0] === "node") {
                let parent =
                  el.classList[0] === "partnernode"
                    ? event.target.__data__.data.partnerinfo
                    : event.target.__data__.data;
                addParent(el, parent, true);
              } else {
                toast.error("No partner selected.");
                nodeClick(el);
              }
              toast.dismiss("selectError");
              $(window).off("click");
              //default
              $(window).on("click", function (event) {
                //Hide the menus if visible
                try {
                  if (event.target !== $("#datalist-input")[0])
                    $("ul.datalist-ul").html("");
                } catch {}
              });
            }
          });
        });

      menu
        .append("button")
        .attr("class", "edit-menu-button parent")
        .text("set parent")
        .on("click", () => {
          editName(el);
          toast.info(`Click on person to set as parent`, {
            autoClose: false,
            position: "top-right",
            toastId: "selectError",
          });
          //add listener for next click
          $(window).on("click", function (event) {
            let classes = event.target.classList;
            if (classes[0] !== "edit-menu-button") {
              if (
                event.target.classList[0] === "node" ||
                event.target.classList[0] === "partnernode"
              ) {
                addParent(el, event.target.__data__.data);
              } else {
                toast.error("No parent selected");
                nodeClick(el);
              }
              toast.dismiss("selectError");
              $(window).off("click");
              //default
              $(window).on("click", function (event) {
                //Hide the menus if visible
                try {
                  if (event.target !== $("#datalist-input")[0])
                    $("ul.datalist-ul").html("");
                } catch {}
              });
            }
          });
          // addParent(el);
        });

      menu
        .append("button")
        .attr("class", "edit-menu-button child")
        .text("child")
        .on("click", () => {
          if (child.name) {
            editName(el);
            return addNode(el, "child");
          }
          toast.error(`Please set name before adding children`);
        });

      menu
        .append("button")
        .attr("class", "edit-menu-button sibling")
        .text("sibling")
        .on("click", () => {
          editName(el);
          addNode(el, "sibling");
        });
      $("input.edit-menu-input").trigger("focus");
    }
    //normal click node function - pan and zoom to clicked node
    else $("#card-container").css("display", "block");

    let data =
      type === "partner" ? el.__data__.data.partnerinfo : el.__data__.data;

    zoom.scaleTo(svg.transition().duration(500), 0.25);
    setInfoCard(data);
    zoom.translateTo(
      svg.transition().duration(500),
      el.__data__.x,
      el.__data__.y
    );
    setTimeout(() => {
      zoom.scaleTo(svg.transition().duration(750), 0.25);
    }, 500);
  }

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
      .append("foreignObject")
      .attr("class", "partnernode-container")
      .attr("x", function (d) {
        return d.x + 50;
      })
      .attr("y", function (d) {
        return d.y - 400;
      })
      .attr("width", 700)
      .attr("height", 500)
      .classed("hide", function (d) {
        try {
          if (d.data.partnerinfo.name === "text") return false;
        } catch {
          return true;
        }
      })
      .append("xhtml:div")
      .attr("class", function (d) {
        return "partnernode level-" + d.depth;
      })
      .on("click", (d) => nodeClick(d.target, "partner"));
    //card pattern
    partnerShapes
      .enter()
      .append("image")
      .attr("xlink:href", pattern)
      .attr("class", function (d) {
        return "pattern level-" + d.depth;
      })
      .attr("x", function (d) {
        return d.x + 50;
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
      .selectAll("foreignObject .node")
      .data(treeData.descendants());

    //normal node rectangle
    shapes
      .enter()
      .append("foreignObject")
      .attr("height", 500)
      .attr("width", 700)
      .attr("class", function (d) {
        return "node-container level-" + d.depth;
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
      .append("xhtml:div")
      .attr("class", function (d) {
        return "node level-" + d.depth;
      })
      .on("click", (d) => nodeClick(d.target, ""));

    //card pattern
    shapes
      .enter()
      .append("image")
      .attr("xlink:href", pattern)
      .attr("class", function (d) {
        return "pattern level-" + d.depth;
      })
      .attr("x", function (d) {
        try {
          if (!d.data.partnerinfo.name === "text") return d.x;
          return d.x - 660;
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
    let birthdate;
    //populate parentSearchDataList
    for (const x of tableData) {
      if (x.id !== 0) {
        birthdate = x.birthdate ? dateFormat(x.birthdate, "dS mmmm yyyy") : "";
        datalistarr.push(
          `${x.generation} ${x.name} <br/> ${birthdate} ${x.id}`
        );
      }
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
    for (var i = 0; i < tableData.length; i++) {
      let namecheck = tableData[i].generation + " " + tableData[i].name;
      if ($.trim(namecheck) === $.trim(nameKey)) {
        return tableData[i].id;
      }
    }
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
    if (searchterm !== "No results." && searchterm) found = true;
    //if focused, if textcontent isnt "No results."
    if (found) {
      if ($("button.changeview-button")[0].textContent === "Read")
        $("#card-container").css("display", "block");
      //get node object
      let n = searchterm.split(" ");
      let id = Number(n[n.length - 1]);
      let tempData = tableData;
      for (const x of tempData) {
        if (x.id === id) {
          node = x;
        }
      }
      let nodeRect = d3.select("svg g.nodes").selectAll("text")._groups[0];
      let dimensions = [];
      for (const x of nodeRect) {
        if (x.__data__.data.id === node.id) {
          dimensions[0] = x.__data__.x;
          dimensions[1] = x.__data__.y;
          if ($("button.changeview-button")[0].textContent === "Edit") {
            nodeClick(x, "");
          }
        } else {
          try {
            if (x.__data__.data.partnerinfo.id === node.id) {
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
        zoom.translateTo(
          svg.transition().duration(500),
          dimensions[0],
          dimensions[1]
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(750), 0.25);
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

  const filterChildren = (id, arr) => {
    let children = arr.filter((x) => {
      return x.pid === Number(id);
    });
    arr = arr.filter((x) => {
      return x.pid !== Number(id);
    });
    arr = arr.filter((x) => x.id !== id);
    try {
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          arr = filterChildren(children[i].id, arr);
        }
      }
    } catch {}
    return arr;
  };

  const openNode = (obj) => {
    $("#parentInput").css("border-bottom", "2px solid #bebed2");
    $("#parentInput").val("");
    $("#parentInput").attr("placeholder", "Parent/Partner");
    let node;
    let str,
      id = "";
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    let temparr = tableData;

    let extData = obj ? obj : InfoCard;

    if (obj) setInfoCard(obj);

    try {
      if (extData.isPartner === 1) {
        id = null;
        for (let i = 0; i < tableData.length; i++) {
          let name = `${tableData[i].generation} ${tableData[i].name}`;
          if (extData.partner === name) {
            id = tableData[i].id;
          } else {
            if (extData.partner === tableData[i].name) id = tableData[i].id;
          }
        }
      } else id = extData.id;
    } catch {
      id = extData.id;
    }
    temparr = filterChildren(id, temparr);
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
      if (extData.id === tableData[i].id) node = tableData[i];
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
      if (event.target !== $("#datalist-input")[0])
        $("ul.datalist-ul").html("");
    } catch {}
  });

  return (
    <div>
      <div className="datalist">
        <input
          id="datalist-input"
          className="input"
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
      <button className="changeview-button" onClick={() => changeView()}>
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
        update={(obj) => {
          dynamicUpdate(obj);
        }}
      />
      <Edit
        getPID={getPID}
        getNode={(id) => getNode(id)}
        radiochecked={radiochecked}
        switchRadio={switchRadio}
        data={tableData}
        datalist={datalist}
        nodedata={InfoCard}
        update={(obj) => {
          dynamicUpdate(obj);
        }}
      />
      <Modal close={closePopups} />
      <ToastContainer position="bottom-right" autoClose={5000} limit={5} />
    </div>
  );
}
