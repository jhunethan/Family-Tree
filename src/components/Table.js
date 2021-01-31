import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as $ from "jquery";

import { ReactTable } from "./React-Table-Components/ReactTable";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";
import EditExtra from "./EditExtra";
import NodeCard from "./NodeCard";

export default function Table() {
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [tableDataExtra, settableDataExtra] = useState([]);
  const [nodestate, setNodestate] = useState(0);
  var [radiochecked, setRadiochecked] = useState(true);
  const [currentRow, setcurrentRow] = useState();

  const switchRadio = () => {
    setRadiochecked(!radiochecked);
  };
  useEffect(() => {
    Axios.get("https://layfamily.herokuapp.com/api/get").then((result) => {
      setTableData(result.data);
    });
    Axios.get("https://layfamily.herokuapp.com/api/getextra").then((result) => {
      settableDataExtra(result.data);
    });
  }, [update]);

  const updateTable = () => {
    //update => useEffect => update tableData => triggers ReactTable rerender
    setUpdate(update + 1);
  };

  const populateEditFields = (node) => {
    $("#genInput").val(node.generation);
    $("#name").val(node.name);
    $("#birthdate").val(node.birthdate);

    let pval;
    if (node.partner.length > 0) {
      pval = node.partner;
    } else {
      pval = node.parent;
    }
    $("#parentInput").val(pval);
    try {
      $("#location-input").val(node.extradetails.location);
      $("#extranames-input").val(node.extradetails.extranames);
      $("#fblink-input").val(node.extradetails.fblink);
      $("textarea.description-input").val(node.extradetails.description);
    } catch {
      $("#location-input").val("");
      $("#extranames-input").val("");
      $("#fblink-input").val("");
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
    let datalistarr = [];
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    for (const x of tableData) {
      datalistarr.push(`${x.generation} ${x.name}`);
    }
    for (var i = 0; i < datalistarr.length; ++i) {
      str += '<option value="' + datalistarr[i] + '" />';
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

  const openNode = (row) => {
    $("#parentInput").css("border-bottom", "2px solid #bebed2");
    $("#parentInput").val("");
    $("#parentInput").attr("placeholder", "Parent/Partner");

    let str = "";
    let datalistarr = [];
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    for (const x of tableData) {
      datalistarr.push(`${x.generation} ${x.name}`);
    }
    for (var i = 0; i < datalistarr.length; ++i) {
      str += '<option value="' + datalistarr[i] + '" />';
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
    $("#card-container").css("display", "flex");
    let children = row.children;
    setcurrentRow(row);
    //only runs if its a database entry
    if (
      !isNaN(row.firstChild.textContent) &&
      row.firstChild.textContent !== "0"
    ) {
      let thisnode = getNode(Number(row.firstChild.textContent));
      let node = {
        id: children[0].textContent,
        generation: children[1].textContent,
        name: children[2].textContent,
        birthdate: children[3].textContent,
        parent: children[4].textContent,
        partner: children[5].textContent,
        isPartner: thisnode.isPartner,
      };

      //check if extra details exists

      for (let i = 0; i < tableDataExtra.length; i++) {
        if (tableDataExtra[i].id === Number(node.id)) {
          node.extradetails = tableDataExtra[i];
        }
      }

      //update current node json object
      setNodestate(node);
    }
  };

  const closePopups = () => {
    $("div.Create").css("display", "none");
    $("#editForm").css("display", "none");
    $("#deleteConfirmMenu").css("display", "none");
    $("div.edit-container").css("display", "none");
  };

  return (
    <div className="TableContainer">
      <div className="container">
        <div className="container-top">
          <div className="left">
            <h2>Family Tree Interactive Table View</h2>
            <p>Click to interact with the table.</p>
            <button
              type="button"
              onClick={() => {
                updateTable();
              }}
            >
              Update Table
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
        getPID={getPID}
        update={() => {
          updateTable();
        }}
      />
      <Edit
        getPID={getPID}
        radiochecked={radiochecked}
        switchRadio={switchRadio}
        data={tableData}
        nodedata={nodestate}
        update={() => {
          updateTable();
        }}
      />
      <NodeCard
        data={nodestate}
        edit={() => {
          openNode(currentRow);
        }}
      />
      <EditExtra currentNode={nodestate} currentNodeName={nodestate.name} />
    </div>
  );
}
