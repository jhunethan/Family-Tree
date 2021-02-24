import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as $ from "jquery";

import { ReactTable } from "./React-Table-Components/ReactTable";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";
import NodeCard from "./NodeCard";

export default function Table(props) {
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);

  const [TreeData, setTreeData] = useState([]);

  //current node/ clicked node state
  const [nodestate, setNodestate] = useState(0);
  const [currentRow, setcurrentRow] = useState();

  var [radiochecked, setRadiochecked] = useState(true);
  const [datalist, setDatalist] = useState([]);

  const switchRadio = () => {
    setRadiochecked(!radiochecked);
  };
  useEffect(() => {
    Axios.get("http://localhost:5000/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  const updateTable = () => {
    //update => useEffect => update tableData => triggers ReactTable rerender
    setUpdate(update + 1);
  };

  async function dynamicUpdate(obj) {
    let data = tableData;
    await setTableData([]);
    //update an edited node
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === obj.id) data[i] = obj;
      }
      //delete node from table
      if (obj.method === "delete") {
        data = await data.filter((x) => x.id !== obj.id);
      }
    } catch {}

    if (obj.method === "create") {
      setTimeout(() => {
        updateTable();
      }, 500);
      
    } else {
      await setTableData(data);
    }
  }
  const populateEditFields = (inputNode) => {
    let node = getNode(inputNode.id);
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

    $("#parentInput").val(node.isPartner ? node.partner : node.parent);

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

  const getNode = (idKey) => {
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].id === idKey) {
        return tableData[i];
      }
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

  const openNode = (row) => {
    $("#parentInput").css("border-bottom", "2px solid #bebed2");
    $("#parentInput").val("");
    $("#parentInput").attr("placeholder", "Parent/Partner");
    let str,
      id = "";
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    let temparr = tableData;
    try {
      if (nodestate.isPartner === 1) {
        id = null;
        for (let i = 0; i < tableData.length; i++) {
          let name = `${tableData[i].generation} ${tableData[i].name}`;
          if (nodestate.partner === name) {
            id = tableData[i].id;
          } else {
            if (nodestate.partner === tableData[i].name) id = tableData[i].id;
          }
        }
      } else id = nodestate.id;
    } catch {
      id = nodestate.id;
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

    //only runs if its a database entry
    if (
      !isNaN(row.firstChild.textContent) &&
      row.firstChild.textContent !== "0"
    ) {
      nodestate.isPartner ? setRadiochecked(false) : setRadiochecked(true);
      //sort out edit menu
      populateEditFields(nodestate);
      $("#Modal").css("display", "block");
      $("#editForm").css("display", "block");
      $("div.edit-container").css("display", "flex");
    }
  };

  const showNode = (row) => {
    try {
      let tempData = tableData;
      let partners = tempData.filter((x) => x.isPartner === 1);
      tempData = tempData.filter((x) => x.isPartner !== 1);
      for (let i = 0; i < partners.length; i++) {
        //get name of parent node
        //make partner object an attribute of parent node (partnerinfo)
        for (let x = 0; x < tempData.length; x++) {
          if (tempData[x].id === partners[i].pid) {
            tempData[x].partnerinfo = partners[i];
          }
        }
      }
      setTreeData(tempData);

      //only runs if its a database entry
      if (
        !isNaN(row.firstChild.textContent) &&
        row.firstChild.textContent !== "0"
      ) {
        setcurrentRow(row);
        $("#card-container").css("display", "block");
        //update current node json object
        setNodestate(getNode(Number(row.firstChild.textContent)));
      }
    } catch {}
  };

  const closePopups = () => {
    $("div.Create").css("display", "none");
    $("#editForm").css("display", "none");
    $("#deleteConfirmMenu").css("display", "none");
    $("div.edit-container").css("display", "none");
  };
  $("#nav-link-two").removeClass("active");
  $("#nav-link-one").removeClass("active");
  $("#nav-link-one").addClass("active");
  $("ul.header-navigation").removeClass("hidden");

  return (
    <div className="TableContainer">
      <div className="container">
        <div className="container-top">
          <div className="left">
            <h2>Family Tree Interactive Table View</h2>
            <p>Click the table to interact.</p>
            <button
              type="button"
              className="refresh-table"
              onClick={() => {
                updateTable();
              }}
            >
              ⟳
            </button>
          </div>
          <div className="right">
            <button id="createNew" onClick={resetCreateFields}>
              New Family Member
            </button>
          </div>
        </div>
        <div className="container-body">
          <ReactTable data={tableData} open={openNode} show={showNode} />
        </div>
      </div>
      <Modal close={closePopups} />
      <Create
        data={tableData}
        getPID={getPID}
        update={() => {
          updateTable();
        }}
      />
      <Edit
        getPID={getPID}
        getNode={(id) => getNode(id)}
        radiochecked={radiochecked}
        switchRadio={switchRadio}
        data={tableData}
        datalist={datalist}
        nodedata={nodestate}
        update={(obj) => {
          dynamicUpdate(obj);
        }}
      />
      <NodeCard
        node={nodestate}
        treeData={TreeData}
        data={tableData}
        update={(obj) => {
          dynamicUpdate(obj);
        }}
        edit={() => {
          openNode(currentRow);
        }}
      />
    </div>
  );
}
