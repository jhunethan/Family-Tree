import React, { useState, useEffect } from "react";
import Axios from "axios";
import { ReactTable } from "./React-Table-Components/ReactTable";
import Create from "./Create.js";
import ExitCatch from "./ExitCatch";
import EditContainer from "./EditContainer";

export default function Table() {
  // eslint-disable-next-line
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [nodestate, setNodestate] = useState(0);
  var currentNode = {
    id: 0,
    generation: "",
    name: "",
    birthdate: "",
    pid: 0,
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/api/get").then((result) => {
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
    document.getElementById("parentInput").value = node.pid;
  };

  const openNode = (row) => {
    let children = row.children;

    //only runs if its a database entry
    if (!isNaN(row.firstChild.textContent)) {
      let node = {
        id: children[0].textContent,
        generation: children[1].textContent,
        name: children[2].textContent,
        birthdate: children[3].textContent,
        pid: children[4].textContent,
      };
      //update current node json object
      currentNode = node;
      setNodestate(node);
      console.log(nodestate);

      //sort out edit menu
      populateEditFields(currentNode);
      document.getElementById("editForm").style.display = "block";
      document.getElementById("exitCatch").style.display = "block";
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
          </div>
          <div className="right">
            <button
              id="createNew"
              onClick={() => {
                try {
                  document.getElementsByClassName("Create")[0].style.display =
                    "block";
                  document.getElementById("exitCatch").style.display = "block";
                } catch {}
              }}
            >
              New Family Member
            </button>
          </div>
        </div>
        <div className="container-body">
          <ReactTable data={tableData} open={openNode} />
        </div>
      </div>
      <ExitCatch close={closePopups} />
      <Create
        update={() => {
          updateTable();
        }}
      />
      <EditContainer
        data={nodestate}
        update={() => {
          updateTable();
        }}
      />
    </div>
  );
}
