import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as $ from "jquery";

import { ReactTable } from "./React-Table-Components/ReactTable";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";
import Header from "./Header";
import NodeCard from "./NodeCard";

export default function Table() {
  // eslint-disable-next-line
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [nodestate, setNodestate] = useState(0);
  var [radiochecked, setRadiochecked] = useState(true);
  const [currentRow, setcurrentRow] = useState();
  var currentNode = {
    id: 0,
    generation: "",
    name: "",
    birthdate: "",
    pid: 0,
  };

  const switchRadio = () => {
    setRadiochecked(!radiochecked);
  };
  useEffect(() => {
    Axios.get("https://layfamily.herokuapp.com/api/get").then((result) => {
      setTableData(result.data);
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
      document.getElementById("toggle-slide").checked = false;
      document.getElementsByClassName("Create")[0].style.display = "block";
      document.getElementById("Modal").style.display = "block";
      document.getElementById("nameInputC").style.borderBottomColor = "#bebed2";
      document.getElementById("nameInputC").placeholder = "";
      document.getElementById("nameInputC").value = "";
      document.getElementById("genInputC").value = "";
      document.getElementById("birthdateInputC").value = "";
      document.getElementById("parentInputC").value = "";
    } catch (err) {
      console.log(err);
    }
  };

  const openNode = (row) => {
    let children = row.children;

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
      //update current node json object
      currentNode = node;
      setNodestate(node);

      node.isPartner ? setRadiochecked(false) : setRadiochecked(true);

      //sort out edit menu
      populateEditFields(currentNode);
      document.getElementById("editForm").style.display = "block";
      document.getElementById("Modal").style.display = "block";
    }
  };

  const showNode = (row) => {
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
      //update current node json object
      setNodestate(node);
    }
  };

  const closePopups = () => {
    document.getElementsByClassName("Create")[0].style.display = "none";
    document.getElementById("editForm").style.display = "none";
    document.getElementById("deleteConfirmMenu").style.display = "none";
  };

  return (
    <div className="TableContainer">
      <Header />
      <div className="container">
        <div className="container-top">
          <div className="left">
            <h2>Family Tree Interactive Table View</h2>
            <p>
              Here you can sort, search and edit any family member by clicking.
              <br /> You can also search to filter results.
            </p>
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
        InfoCardname={nodestate.name}
        InfoCardbirthdate={nodestate.birthdate}
        InfoCardgeneration={nodestate.generation}
        edit={() => {
          openNode(currentRow);
        }}
      />
    </div>
  );
}
