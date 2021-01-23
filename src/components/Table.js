import React, { useState, useEffect } from "react";
import Axios from "axios";
import { ReactTable } from "./React-Table-Components/ReactTable";
import Create from "./Create.js";
import Modal from "./Modal";
import Edit from "./Edit";

export default function Table() {
  // eslint-disable-next-line
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [nodestate, setNodestate] = useState(0);
  var [radiochecked, setRadiochecked] = useState(true);

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
    Axios.get("http://localhost:5000/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  const updateTable = () => {
    //update => useEffect => update tableData => triggers ReactTable rerender
    setUpdate(update + 1);
  };

  const populateEditFields = (node) => {
    document.getElementById("genInput").value = node.generation;
    document.getElementById("name").value = node.name;
    document.getElementById("birthdate").value = node.birthdate;
    let pval;
    node.isPartner === 0 ? (pval = node.parent) : (pval = node.partner);
    document.getElementById("parentInput").value = pval;
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
      if (tableData[i].name === nameKey) {
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
      datalistarr.push(x.name);
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

    let str = "";
    let datalistarr = [];
    let list = document.getElementById("parentSearchDataList");
    //populate parentSearchDataList
    for (const x of tableData) {
      datalistarr.push(x.name);
    }
    for (var i = 0; i < datalistarr.length; ++i) {
      str += '<option value="' + datalistarr[i] + '" />';
    }
    list.innerHTML = str;

    //only runs if its a database entry
    if (!isNaN(row.firstChild.textContent)) {
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

  const closePopups = () => {
    document.getElementsByClassName("Create")[0].style.display = "none";
    document.getElementById("editForm").style.display = "none";
    document.getElementById("deleteConfirmMenu").style.display = "none";
  };

  return (
    <div className="TableContainer">
      <div className="container">
        <div className="container-top">
          <div className="left">
            <h2>Family Tree Interactive Table View</h2>
            <p>
              Here you can sort, search and edit any family member by clicking.
              <br /> You can also search to filter results.
            </p>
            <button type="button" onClick={()=>{updateTable()}}>Update Table</button>
          </div>
          <div className="right">
            <button id="createNew" onClick={resetCreateFields}>
              New Family Member
            </button>
          </div>
        </div>
        <div className="container-body">
          <ReactTable data={tableData} open={openNode} />
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
    </div>
  );
}
