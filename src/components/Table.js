import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const switchRadio = (val) => {
    if (val.value === "child") return setRadiochecked(true);
    return setRadiochecked(false);
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
  }

  const populateEditFields = (inputNode) => {
    let node = getNode(inputNode.id),
      opStack = [
        "birthplace",
        "location",
        "extranames",
        "fblink",
        "profession",
        "languages",
      ];

    $("#generation-input").val(node.generation);
    $("#name-input").val(node.name);
    $("#birthdate-input").val(node.birthdate);

    node.deathdate
      ? $("#isDeceased").attr("checked", true)
      : $("#isDeceased").attr("checked", false);

    $("#deathdate-input")
      .css("display", node.deathdate ? "block" : "none")
      .val(node.deathdate ? node.deathdate : "");

    $("#parentInput").val(node.isPartner ? node.partner : node.parent);

    try {
      if (node.isPartner) {
        $("#maidenname-input").css("display", "block");
        $("label.maidenname").css("display", "block");
        try {
          $("#maidenname-input").val(node.extradetails.maidenname);
        } catch {}
      } else {
        $("#maidenname-input").css("display", "none").val("");
        $("label.maidenname").css("display", "none");
      }

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

  const getNode = (idKey) => {
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].id === idKey) {
        return tableData[i];
      }
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
        update={(obj) => {
          dynamicUpdate(obj);
        }}
      />
      <Edit
        toast={(msg)=>toast(msg)}
        getPID={getPID}
        getNode={(id) => getNode(id)}
        radiochecked={radiochecked}
        switchRadio={(val) => switchRadio(val)}
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
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
