import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";
import * as $ from "jquery";
import "../css/Tree.css";
import "dateformat";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";

import profile from "../css/person-placeholder.jpg";
import loading from "../css/loading.gif";
// import layCharacter from "../css/layCharacter.png";

import { EditPhotoCondition } from "./Table";
import NodeCard from "./NodeCard";
import Modal from "./Modal";
import Edit from "./Edit";
import Create from "./Create";
import TreeSearch from "./TreeSearch";

//card blueprint
// <div className="tree-card">
// <div className="tree-card-section">
//   <img className="tree-card-profile" src={"placeholder"} alt="placeholder" />
//   <p className="tree-card-profession">Carpenter</p>
// </div>
// <div className="tree-card-section">
//   <p className="tree-card-gen">Hau</p>
//   <p className="tree-card-name">Jhun Ethan Lay</p>
//   <p className="tree-card-birthdate">2001 - Present</p>
// </div>
// </div>

function TreeNav(props) {
  const [cookies, setCookies, removeCookies] = useCookies(["lay-access"]);
  const history = useHistory();
  function toggle() {
    $(".tree-nav-button").toggleClass("hidden");
  }

  function logout() {
    console.log(`${cookies["lay-email"]} has been logged out`);
    setCookies("lay-access", "");
    removeCookies("lay-email");
    removeCookies("lay-password");
    removeCookies("lay-access");
    history.push("/");
  }

  return (
    <div className="tree-nav">
      <button className="tree-nav-toggle btn-primary" onClick={toggle}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <button
        className="tree-nav-button hidden changeview-button"
        onClick={() => props.changeView()}
      >
        Read Mode
      </button>
      <button className="tree-nav-button hidden logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default function Tree(props) {
  const [cookies] = useCookies(["lay-family"]);
  const [welcome, setWelcome] = useState(false);
  //triggers server data fetch and page rerender
  const [update, setUpdate] = useState(false);
  //datalist for search autocomplete
  const [datalist, setDatalist] = useState([]);
  //holds all data with all family members in JSON form
  const [tableData, setTableData] = useState(undefined);
  //partner/parent toggle
  const [radiochecked, setRadiochecked] = useState(true);
  //read/edit mode toggle
  const [editview, seteditView] = useState(false);
  const [create, setCreate] = useState();
  const [currentImage, setCurrentImage] = useState(undefined);
  //holds info about selected user
  const [InfoCard, setInfoCard] = useState({});
  var dateFormat = require("dateformat");
  var height;
  var width;
  var datalistarr,
    treeData = [];

  const switchRadio = (val) => {
    if (val.value === "child") return setRadiochecked(true);
    return setRadiochecked(false);
  };

  const changeView = () => {
    seteditView((prev) => !prev);
    if (editview) {
      $("foreignObject.edit-menu-container").remove();
      toast.info("Read Mode");
      return ($("button.changeview-button")[0].textContent = "Read Mode");
    }
    $("button.changeview-button")[0].textContent = "Edit Mode";
    $("#card-container").css("display", "none");
    toast.info("Edit Mode, click any node to edit");
  };

  useEffect(() => {
    var start = Date.now();

    const serverCheck = setInterval(() => {
      const currentLoadTime = (Date.now() - start) / 1000;
      if (currentLoadTime > 5) {
        toast.error("Please refresh the page.", {
          position: "top-center",
          autoClose: false,
        });
        toast.error(
          "Server took too long to respond. There may be an issue with the server.",
          { position: "top-center", autoClose: false }
        );
        clearInterval(serverCheck);
      }
    }, 500);

    Axios.get(process.env.REACT_APP_API + "api/familymembers").then(
      (result) => {
        setTableData(result.data);
        if (result.data) {
          let loadTime = (Date.now() - start) / 1000;
          clearInterval(serverCheck);
          toast.success(`Tree loaded in ${loadTime} s`, {
            position: "top-center",
            autoClose: 2500,
            toastId: "TreeLoaded",
          });
        }
      }
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

  // //triggers a data request
  // const updateTree = async () => {
  //   await converttreeData();
  //   d3.select("svg g.nodes").enter().data(treeData.descendants());
  // };

  const resetCreateFields = () => {
    try {
      for (const element of ["dd", "mm", "yyyy"]) {
        $(`#create-birthdate-${element}`).val("");
      }

      $("#editForm").css("display", "none");
      $(".radio-togglesC").css("display", "none");
      $("#parentSearchDataList").html("");
      $("#toggle-slide").checked = false;
      $("div.create-form").css("display", "block");
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

  const getNode = (idKey) => {
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].id === idKey) {
        return tableData[i];
      }
    }
  };

  // const normalise = (text) => {
  //   text = text.toLowerCase();
  //   return $.trim(text).replace(/\w\S*/g, (w) =>
  //     w.replace(/^\w/, (c) => c.toUpperCase())
  //   );
  // };

  async function dynamicUpdate(input) {
    //optimistic rendering
    let data = tableData;

    if (!input) {
      await setTableData([]);
      await setTableData(data);
      return;
    }

    let obj = input;

    if (Array.isArray(input) && input.length) {
      obj = input[0];
    }

    //update an edited node
    if (obj.method === "delete") {
      data = data.filter((x) => x.id !== obj.id);
      for (let i = 0; i < data.length; i++) {
        if (data[i].prevPid) {
          data[i].pid = data[i].prevPid;
          data[i].parent = data[i].prevParent;
          delete data[i].prevPid;
          delete data[i].prevParent;
        }
        if (data[i].pid === obj.id) {
          data[i].pid = 0;
          data[i].parent = "";
        }
        if (data[i].secondPid === obj.id) {
          data[i].secondPid = 0;
          data[i].secondParent = "";
        }
        if (obj.isPartner && data[i].id === obj.pid) {
          data[i].partnerinfo = undefined;
        }
      }
      toast.error(`Removed ${obj.name}`);

      await setTableData([]);
      setTimeout(() => {
        setTableData(data);
      }, 150);

      if (Array.isArray(input) && input.length > 1) {
        for (let i = 1; i <= input.length; i++) {
          dynamicUpdate(input[i]);
        }
      }
      return;
    } else if (obj.method === "create") {
      for (let i = 0; i < data.length; i++) {
        if (obj.id === data[i].id) return false;
        if (obj.isPartner) {
          if (data[i].id === obj.pid) data[i].partnerinfo = obj;
        }
      }
      obj.method = undefined;
      data.push(obj);
      if (obj.name) {
        toast.success(`Added ${obj.name}`);
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === obj.id) data[i] = obj;
        if (obj.isPartner) {
          if (data[i].id === obj.pid) data[i].partnerinfo = obj;
          if (data[i].pid === obj.id) {
            data[i].pid = 0;
            data[i].parent = "";
            if (data[i].isPartner) {
              data[i].partner = "";
              data[i].isPartner = 0;
            }
          }
          try {
            if (data[i].partnerinfo.id === obj.id) {
              data[i].partnerinfo = null;
            }
          } catch {}
        } else {
          try {
            if (data[i].partnerinfo.id === obj.id)
              data[i].partnerinfo = undefined;
            for (let x = 0; x < data.length; x++) {
              if (data[x].oldpid === obj.id) data[x].pid = obj.id;
            }
          } catch {}
        }
      }
      toast.success(`Changes made to ${obj.name}`);
    }

    if (obj.id)
      setTimeout(() => {
        search(obj.id);
      }, 1000);

    await setTableData([]);
    setTimeout(() => {
      setTableData(data);
    }, 150);

    if (Array.isArray(input) && input.length > 1) {
      for (let i = 1; i <= input.length; i++) {
        dynamicUpdate(input[i]);
      }
    }
  }

  const closePopups = () => {
    for (const element of [
      "div.create-form",
      "#editForm",
      "#deleteConfirmMenu",
      "div.edit-container",
      "#Modal",
    ]) {
      $(`${element}`).css("display", "none");
    }
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

  var zoom = d3
    .zoom()
    .extent([
      [0, 0],
      [$("#Tree").width(), $("#Tree").height()],
    ])
    .scaleExtent([0.05, 0.5])
    .on("zoom", zoomed);

  var svg = d3.select("#Tree");

  // function connectParent(child, parent, partner) {
  //   //delete parent

  //   if (parent === "delete") {
  //     let obj = child.__data__.data;

  //     if (partner) {
  //       obj = obj.partnerinfo;
  //     }

  //     obj.pid = 0;
  //     obj.parent = "";
  //     obj.partner = "";
  //     obj.isPartner = 0;
  //     Axios.patch(process.env.REACT_APP_API + "api/familymembers", {
  //       input: obj,
  //       name: obj.name,
  //       author: cookies.author,
  //       changes: "removed parent",
  //     });
  //     dynamicUpdate(obj);
  //     return;
  //   }

  //   if (partner) {
  //     //make sure parent is valid

  //     let obj = child.__data__.data;
  //     obj = child["classList"][0] === "partnernode" ? obj.partnerinfo : obj;

  //     function checkValidPartner() {
  //       if (parent.id === obj.id) return false;
  //       if (parent.partnerinfo) return false;
  //       if (parent.isPartner) return false;
  //       return true;
  //     }

  //     if (checkValidPartner()) {
  //       if (obj.name) {
  //         obj.pid = parent.id;
  //         obj.parent = "";
  //         obj.partner = parent.name;
  //         obj.isPartner = 1;
  //         Axios.patch(process.env.REACT_APP_API + "api/familymembers", {
  //           input: obj,
  //           name: obj.name,
  //           author: cookies.author,
  //           changes: "partner,isPartner",
  //         });
  //         dynamicUpdate(obj);
  //       } else {
  //         toast.error("Please set name before setting as partner");
  //       }
  //     } else {
  //       toast.error("Invalid partner, try again");
  //     }

  //     return;
  //   }

  //   //make sure parent is valid
  //   let arr = filterChildren(Number(child.__data__.data.id), tableData);

  //   if (arr.includes(parent)) {
  //     let obj = child.__data__.data;
  //     obj = child["classList"][0] === "partnernode" ? obj.partnerinfo : obj;
  //     obj.pid = Number(parent.id);
  //     obj.parent = parent.name;
  //     obj.isPartner = 0;
  //     obj.partner = "";

  //     Axios.patch(process.env.REACT_APP_API + "api/familymembers", {
  //       input: obj,
  //       name: obj.name,
  //       author: cookies.author,
  //       changes: "parent,isPartner",
  //     });
  //     dynamicUpdate(obj);
  //   } else {
  //     toast.error("Invalid parent, try again");
  //   }
  // }

  function addNode(el, method) {
    const { __data__: metadata } = el;
    //new child
    let node = metadata.data;
    switch (method) {
      case "child":
        toast.success(`Child Added to ${node.name}`);
        break;
      case "sibling":
        node = metadata.parent;
        toast.success(`Sibling Added to ${node.name}`);
        break;
      case "parent":
        node = { id: 0, name: "" };
        break;
      default:
    }

    //set unique insert ID
    let idArray = [],
      newId = 1;

    for (let i = 0; i < tableData.length; i++) {
      idArray.push(tableData[i].id);
    }
    while (idArray.includes(newId)) newId += 1;
    //new child default values
    let newChild = {
      id: newId,
      birthdate: "",
      generation: "",
      name: "",
      deathdate: null,
      pid: node.id,
      isPartner: 0,
      parent: node.name,
      method: "create",
    };

    resetCreateFields();
    setCreate({
      type: method,
      origin: el.__data__.data.name,
      id: newId,
      newInfo: newChild,
    });
    if (method === "parent")
      return dynamicUpdate([
        newChild,
        {
          ...metadata.data,
          pid: newId,
          prevPid: metadata.data.pid,
          prevParent: metadata.data.parent,
        },
      ]);
    return dynamicUpdate(newChild);
  }

  function nodeClick(event, isPartner, edit) {
    const { target: el } = event;
    const metadata = el.__data__;
    let data = isPartner ? el.__data__.data.partnerinfo : el.__data__.data;
    setInfoCard(data);

    //alternative function
    //show a edit menu for a node letting the user change the tree dynamically
    if (edit) {
      //remove other instances of edit menus
      $("#card-container").css("display", "none");
      $("foreignObject.edit-menu-container").remove();
      //open edit menu
      d3.select("g.nodes")
        .append("foreignObject")
        .attr("class", "edit-menu-container")
        .attr("x", function () {
          if (data.partnerinfo) return metadata.x - 650;
          if (data.isPartner) return metadata.x + 50;
          return metadata.x - 300;
        })
        .attr("y", () => metadata.y - 75)
        .attr("height", "600px")
        .attr("width", "600px");

      let menu = d3
        .select("foreignObject.edit-menu-container")
        .append("xhtml:main")
        .attr("class", "edit-menu")
        .call(d3.zoom());

      menu
        .append("xhtml:div")
        .attr("class", "edit-menu-option")
        .html("Add new person...")
        .attr("title", "Add new person...")
        .on("click", () => {
          $("main.edit-menu").html("");

          let menu = d3.select("main.edit-menu");
          menu
            .append("xhtml:div")
            .attr("class", "edit-menu-option")
            .html("<< Back")
            .attr("title", "<< Back")
            .on("click", () => nodeClick(event, isPartner, edit));
          menu
            .append("xhtml:div")
            .attr("class", "edit-menu-option")
            .html("Child")
            .attr("title", "Child")
            .on("click", () => addNode(el, "child"));
          menu
            .append("xhtml:div")
            .attr("class", "edit-menu-option")
            .html("Parent")
            .attr("title", "Parent")
            .on("click", () => addNode(el, "parent"));

          menu
            .append("xhtml:div")
            .attr("class", "edit-menu-option")
            .html("Sibling")
            .attr("title", "Sibling")
            .on("click", () => addNode(el, "sibling"));
        });

      menu
        .append("xhtml:div")
        .attr("class", "edit-menu-option")
        .html("New relationship...")
        .attr("title", "Add new relationship...");
      menu
        .append("xhtml:div")
        .attr("class", "edit-menu-option")
        .html("Edit this person...")
        .attr("title", "Edit this person...")
        .on("click", () => openNode(data));

      return;
    }
    //normal click node function - pan and zoom to clicked node
    else $("#card-container").css("display", "block");

    document.getElementsByClassName("card-main")[0].scrollTop = 0;

    zoom.scaleTo(svg.transition().duration(500), 0.35);
    zoom.translateTo(
      svg.transition().duration(500),
      el.__data__.x + 250,
      el.__data__.y
    );
    setTimeout(() => {
      zoom.scaleTo(svg.transition().duration(750), 0.35);
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
    treeLayout.nodeSize([1400, 670]);
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

    let partnerContainer = partnerShapes
      .enter()
      .append("foreignObject")
      .attr("class", "partnernode-container")
      .attr("id", function (d) {
        return `partnernode ${d.data.partnerinfo.id}`;
      })
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
      .on("click", (d) => nodeClick(d, "partner"));

    let partnerBody = partnerContainer
      .append("xhtml:div")
      .attr("class", function (d) {
        return "partnernode tree-card level-" + d.depth;
      })
      .attr("title", (d) => {
        const { generation, name, birthdate } = d.data.partnerinfo;
        let userDetails = generation ? `${generation}\n` : "";
        userDetails += `${name}\n${birthdate}`;
        return userDetails;
      })
      .on("click", (d) => nodeClick(d, ""))
      .on("contextmenu", function (d, i) {
        d.preventDefault();
        // react on right-clicking
        //remove other instances of edit menus
        nodeClick(d, "partner", true);
      });
    partnerShapes
      .enter()
      .append("text")
      .attr("class", "icon")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 450;
      })
      .style("font-size", "50px")
      .text(function (d) {
        try {
          const { marriagedate } = d.data.partnerinfo.extradetails;
          if (marriagedate)
            return `Married - ${dateFormat(marriagedate, "dS mmmm yyyy")}`;
        } catch {}
        return null;
      });

    let partnerLeft = partnerBody
      .append("xhtml:div")
      .attr("class", "tree-card-section left");

    partnerLeft
      .append("xhtml:img")
      .attr("src", function (d) {
        // try {
        //   if (d.data.extradetails.photo_id.length > 1) {
        //     console.log((d.data.extradetails.photo_id))
        //     Axios.get(process.env.REACT_APP_API+"api/get/photos/user", {
        //       params: { id: d.data.id },
        //     }).then((res) => {
        //       console.log(res)
        //       return 'data:image/png;base64,' + btoa(res.data);
        //     });
        //   }
        // } catch {}
        return profile;
      })
      .attr("class", "tree-card-profile");

    let partnerRight = partnerBody
      .append("xhtml:div")
      .attr("class", "tree-card-section right");

    partnerRight
      .append("p")
      .attr("class", "tree-card-gen")
      .text(function (d) {
        return d.data.partnerinfo.generation;
      });

    partnerRight
      .append("p")
      .text(function (d) {
        return d.data.partnerinfo.name;
      })
      .attr("class", "tree-card-name");

    partnerRight
      .append("xhtml:p")
      .attr("class", "tree-card-birthdate")
      .html(function (d) {
        let enddate,
          startdate = d.data.partnerinfo.birthdate
            ? dateFormat(d.data.partnerinfo.birthdate, "yyyy")
            : "????";

        try {
          let deathdate = d.data.partnerinfo.deathdate;
          enddate = deathdate ? dateFormat(deathdate, "yyyy") : "Present";
        } catch {
          enddate = "Present";
        }
        if (d.data.partnerinfo.birthdate) return `${startdate} - ${enddate}`;
        return "???? - ????";
      });

    // normally placed nodes
    var shapes = d3
      .select("svg g.nodes")
      .selectAll("foreignObject .node")
      .data(treeData.descendants());

    //normal node rectangle
    let container = shapes
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
      });

    let body = container
      .append("xhtml:div")
      .attr("class", function (d) {
        return "node tree-card level-" + d.depth;
      })
      .attr("title", (d) => {
        const { generation, name, birthdate } = d.data;
        let userDetails = generation ? `${generation}\n` : "";
        userDetails += `${name}\n${birthdate}`;
        return userDetails;
      })
      .on("click", (d) => nodeClick(d, ""))
      .on("contextmenu", function (d, i) {
        d.preventDefault();
        // react on right-clicking
        //remove other instances of edit menus
        nodeClick(d, "", true);
      });

    let left = body.append("xhtml:div").attr("class", "tree-card-section left");

    left
      .append("xhtml:img")
      .attr("src", function (d) {
        // try {
        //   if (d.data.extradetails.photo_id.length > 1) {
        //     console.log((d.data.extradetails.photo_id))
        //     Axios.get(process.env.REACT_APP_API+"api/get/photos/user", {
        //       params: { id: d.data.id },
        //     }).then((res) => {
        //       console.log(res)
        //       return 'data:image/png;base64,' + btoa(res.data);
        //     });
        //   }
        // } catch {}
        return profile;
      })
      .attr("class", "tree-card-profile");

    let right = body
      .append("xhtml:div")
      .attr("class", "tree-card-section right");

    right
      .append("p")
      .attr("class", "tree-card-gen")
      .text(function (d) {
        return d.data.generation;
      });

    right
      .append("p")
      .text(function (d) {
        return d.data.name;
      })
      .attr("class", "tree-card-name");

    right
      .append("xhtml:p")
      .attr("class", "tree-card-birthdate")
      .html(function (d) {
        let enddate,
          startdate = d.data.birthdate
            ? dateFormat(d.data.birthdate, "yyyy")
            : "????";
        try {
          let deathdate = d.data.deathdate;
          enddate = deathdate ? dateFormat(deathdate, "yyyy") : "Present";
        } catch {
          enddate = "Present";
        }
        if (d.data.birthdate) return `${startdate} - ${enddate}`;
        return "???? - ????";
      });
    links = d3.select("svg g.links").selectAll("path").data(linksData);
    links
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "link level-" + d.source.depth;
      })
      .attr("d", function (d) {
        const { data: parent } = d.source;
        const { data: child } = d.target;
        let path =
          "M" +
          d.target.x +
          "," +
          (d.target.y - 350) +
          " v -300 H" +
          d.source.x +
          " V" +
          (d.source.y - 25);

        if (parent.partnerinfo) {
          if (child.parent && child.parent.includes(parent.name)) {
            path += " h-350";
          } else {
            path += " h350";
          }
          path += " v-200";
        } else path += " v-200";

        return path;
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

    function getSecondParent(parentId, data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].data.id && data[i].data.id === parentId) {
          return data[i];
        }
        try {
          if (data[i].data.partnerinfo.id === parentId) {
            const output = {
              ...data[i],
              id: data[i].data.partnerinfo.id,
              x: data[i].x,
              y: data[i].y,
              data: data[i].data.partnerinfo,
            };
            return output;
          }
        } catch {}
      }
    }

    const secondParentData = linksData.filter((d) => {
      return d.target.data.secondPid;
    });
    const secondaryParentCoords = secondParentData.map((d) => {
      const parent = getSecondParent(
        d.target.data.secondPid,
        treeData.descendants()
      );
      const data = {
        source: parent,
        target: d.target,
      };
      return data;
    });

    links
      .enter()
      .data(secondaryParentCoords)
      .append("path")
      .attr("class", function (d) {
        return "link level-" + d.source.depth;
      })
      .attr("d", function (d) {
        const { data: parent } = d.source;
        const { data: child } = d.target;
        let path =
          "M" +
          d.target.x +
          "," +
          (d.target.y - 350) +
          " v -300 H" +
          d.source.x +
          " V" +
          (d.source.y - 25);
        if (parent.isPartner) {
          if (child.parent.includes(parent.name)) {
            path += " h-350";
          } else {
            path += " h350";
          }
          path += " v-200";
        } else path += " v-200";
        return path;
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
    $("#datalist-input").attr("placeholder", "Search...");

    let str = "";
    datalistarr = [];
    let list = $("ul.datalist-ul");
    let birthdate;
    //populate parentSearchDataList
    for (const x of tableData) {
      if (x.id !== 0) {
        birthdate = x.birthdate ? dateFormat(x.birthdate, "dS mmmm yyyy") : "";
        datalistarr.push({
          name: `${x.generation} ${x.name} <br/> ${birthdate}`,
          id: x.id,
        });
      }
    }

    if ($("#datalist-input").val()) {
      let parsed = $.trim($("#datalist-input").val().toLowerCase()).split(" ");
      datalistarr = datalistarr.filter((x) => {
        for (const word of parsed) {
          if (!x.name.toLowerCase().includes(word)) return false;
        }
        return true;
      });
    }

    for (var i = 0; i < datalistarr.length; ++i) {
      str += `<li data-id=${datalistarr[i].id}>${datalistarr[i].name}</>`;
    }
    list.html(str);

    if (datalistarr.length === 0 && $.trim($("#datalist-input").val())) {
      list.html(`<li>No results.</li>`);
    }
  };

  const getPID = (nameKey) => {
    for (var i = 0; i < tableData.length; i++) {
      let namecheck = tableData[i].generation + " " + tableData[i].name;
      if (
        $.trim(namecheck) === $.trim(nameKey) ||
        $.trim(tableData[i].name) === $.trim(nameKey)
      ) {
        return tableData[i].id;
      }
    }
  };

  const resetDatalistCSS = () => {
    return $("#datalist-input").val("").attr("placeholder", "Search...");
  };

  const search = (input) => {
    let id = Number($.trim(input));
    let currentNode;

    setWelcome(true);
    resetDatalistCSS();
    populateDatalist();

    if (id) {
      if ($("button.changeview-button")[0].textContent === "Read mode")
        $("#card-container").css("display", "block");

      currentNode = getNode(id);

      let nodes = d3.select("svg g.nodes").selectAll("foreignObject")
        ._groups[0];
      let dimensions = [];

      if (nodes) {
        for (const x of nodes) {
          if (x.__data__.data.id === currentNode.id) {
            dimensions[0] = x.__data__.x + 250;
            dimensions[1] = x.__data__.y;
            if ($("button.changeview-button")[0].textContent === "Edit Mode") {
              nodeClick(x, "");
            }
          } else {
            try {
              if (x.__data__.data.partnerinfo.id === currentNode.id) {
                dimensions[0] = x.__data__.x + 250;
                dimensions[1] = x.__data__.y;
              }
            } catch {}
          }
        }

        setInfoCard(currentNode);
        zoom.scaleTo(svg.transition().duration(1000), 0.35);
        $("ul.datalist-ul").html("");
        zoom.translateTo(
          svg.transition().duration(1000),
          dimensions[0],
          dimensions[1]
        );
        setTimeout(() => {
          zoom.scaleTo(svg.transition().duration(1000), 0.35);
        }, 1000);

        return true;
      }
    }

    $("#datalist-input").css("border", "2px solid red");
    $("#datalist-input").attr("placeholder", "Person not found.");
    return false;
  };

  const populateEditFields = (inputNode) => {
    let node = getNode(inputNode.id),
      opStack = ["birthplace", "location", "fblink", "profession"];

    $("#generation-input").val(node.generation);
    $("#name-input").val(node.name);

    const birthdateArr = node.birthdate.split("-");
    ["yyyy", "mm", "dd"].forEach((item, index) => {
      $(`#birthdate-${item}`).val(birthdateArr[index]);
    });

    $("#isDeceased").attr("checked", node.deathdate ? true : false);

    $("#deathdate-input").val(node.deathdate ? node.deathdate : "");
    $(`#parentInput`).val("");
    try {
      for (const x of opStack) {
        $(`#${x}-input`).val(node.extradetails[x]);
      }
      $("textarea.description-input").val(node.extradetails.description);
    } catch {
      for (const x of opStack) {
        $(`#${x}-input`).val("");
      }
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
    $("#parentInput").attr("placeholder", "Name of Parent");
    $("#card-container").css("display", "none");
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
      if (temparr[i].name)
        str += `<li>${temparr[i].generation} ${temparr[i].name} </li>`;
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

  $("ul.header-navigation").removeClass("hidden");
  $(window).on("click", function (event) {
    //Hide the menus if visible
    try {
      if (![...event.target.classList].includes("edit-menu-option"))
        $("foreignObject.edit-menu-container").remove();
      if (event.target !== $("#datalist-input")[0])
        $("ul.datalist-ul").html("");
    } catch {}
  });

  $(window).on("contextmenu", function (event) {
    event.preventDefault();
    //Hide the menus if visible
    try {
      if (
        ![...event.target.classList].includes("edit-menu-option") &&
        ![...event.target.classList].includes("tree-card")
      )
        $("foreignObject.edit-menu-container").remove();
      if (event.target !== $("#datalist-input")[0])
        $("ul.datalist-ul").html("");
    } catch {}
  });

  return (
    <div>
      <TreeWelcome
        filter={() => populateDatalist()}
        search={(val) => search(val)}
        node={InfoCard}
        data={tableData}
        welcome={welcome}
        setWelcome={(status) => {
          setWelcome(status);
        }}
      />
      <button
        className="tree-create-button btn-primary"
        onClick={() => resetCreateFields()}
      >
        <span className="plus-symbol">+</span>
      </button>
      <TreeNav
        resetCreateFields={() => resetCreateFields()}
        changeView={() => changeView()}
      />
      <NodeCard
        show={(obj) => {
          setInfoCard(obj);
          document.getElementsByClassName("card-main")[0].scrollTop = 0;
          search(obj.id);
        }}
        toast={toast}
        update={() => setUpdate((prevUpdate) => !prevUpdate)}
        node={InfoCard}
        treeData={tableData}
        edit={() => openNode()}
        editPhoto={(img) => {
          setCurrentImage(img);
        }}
        closePopups={() => closePopups()}
      />
      <svg id="Tree"></svg>
      <Edit
        toast={(msg) => toast.error(msg)}
        getPID={(data) => getPID(data)}
        getNode={(id) => getNode(id)}
        radiochecked={radiochecked}
        switchRadio={(val) => switchRadio(val)}
        data={tableData}
        datalist={datalist}
        nodedata={InfoCard}
        update={(obj) => {
          dynamicUpdate(obj);
        }}
        closePopups={closePopups}
      />
      <Modal close={closePopups} />
      {create ? (
        <Create
          closePopups={closePopups}
          submitNew={(newPerson) => {
            //set locally
            dynamicUpdate(newPerson);
            //axios post
            Axios.post(process.env.REACT_APP_API + "api/familymembers", {
              input: newPerson,
              author: cookies["lay-emai"],
            }).then(() => toast.success(`${newPerson.name} Added!`));
            //update any children
            for (const person of tableData) {
              if (person.pid === newPerson.id) {
                Axios.patch(process.env.REACT_APP_API + "api/familymembers", {
                  id: newPerson.id,
                  name: newPerson.name,
                  input: newPerson,
                  author: cookies["lay-email"],
                  changes: "pid,parent",
                });
              }
            }

            closePopups();
          }}
          cancelNew={(data) => {
            closePopups();
            dynamicUpdate({ ...data, method: "delete" });
          }}
          data={tableData}
          getPID={(data) => getPID(data)}
          update={(obj) => {
            dynamicUpdate(obj);
          }}
          relationship={create}
        />
      ) : (
        <Create
          closePopups={closePopups}
          data={tableData}
          getPID={(data) => getPID(data)}
          update={(obj) => {
            dynamicUpdate(obj);
          }}
        />
      )}

      <ToastContainer
        hideProgressBar={true}
        position="top-center"
        autoClose={5000}
        limit={5}
      />
      <EditPhotoCondition
        closePopups={() => closePopups()}
        image={currentImage}
        setImage={(obj) => setCurrentImage(obj)}
        update={(obj) => {
          dynamicUpdate(obj);
        }}
        node={InfoCard}
      />
    </div>
  );
}

function TreeWelcome(props) {
  // let personSelected = false;

  if (props.data) {
    // const randomSearch = () => {
    //   try {
    //     let arr = [],
    //       data = props.data;
    //     data.map((person) => {
    //       if (person.id === 0) return null;
    //       return arr.push(`${person.id}`);
    //     });

    //     let randomID = arr[Math.floor(Math.random() * arr.length)];

    //     props.search(randomID);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    // try {
    //   if (props.node.name) personSelected = true;
    // } catch {}
    // return (
    //   <div className="tree-welcome">
    //     <a href="/" className="nav-logo-container">
    //       <img src={layCharacter} alt="logo" className="landing-logo" />
    //     </a>
    //     <a href="/" className="nav-logo-container">
    //       <h1 className="tree-welcome-title landing-title">
    //         Lay Family Tree
    //       </h1>
    //     </a>
    //     <p>Search for a family member to continue</p>
    //     <div className="tree-welcome-modal" />
    //     <TreeSearch
    //       align={"auto"}
    //       filter={() => props.filter()}
    //       search={(val) => props.search(val)}
    //     />
    //     <div className="tree-welcome-search-container" />
    //     <p>or</p>
    //     <button id="datalistbutton" className="btn btn-primary margin-auto" onClick={() => randomSearch()}>
    //       Random family member
    //     </button>
    //   </div>
    // );
    //fade out
    $(".tree-welcome-modal").css("background-color", "rgba(255, 255, 255, 0)");
    //wait a second

    //continue

    return (
      <TreeSearch
        align={0}
        filter={() => props.filter()}
        search={(val) => props.search(val)}
      />
    );
  } else {
    return (
      <div className="loading-container">
        <img src={loading} alt="loading" />
      </div>
    );
  }
}
