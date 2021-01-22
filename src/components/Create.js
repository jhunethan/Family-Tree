import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";
import * as $ from "jquery";

function Create(props) {
  const [sendNode, setsendNode] = useState({
    pid: 0,
    generation: "",
    name: "",
    birthdate: "",
    parent: "",
    partner: "",
    parentNode: "",
    isPartner: 0,
  });
  var node = {
    pid: 0,
    generation: "",
    name: "",
    birthdate: "",
    parent: "",
    partner: "",
    parentNode: "",
    isPartner: 0,
  };

  const inputChangedHandler = () => {
    node.parentNode = document.getElementById("parentInputC").value;
    let pid = document.getElementById("toggle-slide").checked,
      isPartner = 0;
    console.log(pid);
    if (pid === false) {
      node.parent = node.parentNode;
    } else {
      node.partner = node.parentNode;
      isPartner = 1;
    }
    try {
      pid = props.getPID(node.parentNode);
    } catch {
      pid = 0;
    }

    setsendNode({
      generation: document.getElementById("genInputC").value,
      name: document.getElementById("nameInputC").value,
      birthdate: document.getElementById("birthdateInputC").value,
      pid: pid,
      isPartner: isPartner,
      parent: node.parent,
      partner: node.partner,
    });
  };

  const whitespace = (str) => {
    if (str === undefined) return "";
    return $.trim(str);
  };

  const successAdd = () => {
    try {
      document.getElementsByClassName("Create")[0].style.display = "none";
      document.getElementById("Modal").style.display = "none";
    } catch {}

    setTimeout(() => {
      props.update();
    }, 200);
  };

  const validation = () => {
    let nameinput = document.getElementById("nameInputC");
    if (whitespace(nameinput.value) !== "") {
      setsendNode(node);
      return true;
    } else {
      //empty, apply error styles
      nameinput.style.borderBottomColor = "red";
      nameinput.placeholder = "Name can not be empty";
    }
  };

  const submit = () => {
    if (node.isPartner === 0) {
      node.parent = node.parentNode;
    }

    inputChangedHandler();
    console.log(sendNode);
    setTimeout(() => {
      if (validation()) {
        Axios.post("https://lay-family-tree.herokuapp.com/api/insert", {
          pid: sendNode.pid,
          generation: sendNode.generation,
          name: sendNode.name,
          birthdate: sendNode.birthdate,
          parent: sendNode.parent,
          partner: sendNode.partner,
        }).then(successAdd());
      }
    }, 500);
  };

  return (
    <div className="Create">
      <h2>Add New</h2>

      <p type="Generation">
        <input
          id="genInputC"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("nameInputC").focus();
            }
          }}
        />
      </p>
      <p type="Name:">
        <input
          id="nameInputC"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("birthdateInputC").focus();
            }
          }}
        />
      </p>
      <p type="Date of Birth">
        <input
          type="date"
          id="birthdateInputC"
          onChange={inputChangedHandler}
          placeholder="YYYY-MM-DD"
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("parentInputC").focus();
            }
          }}
        />
      </p>

      {/* Search for parent autocomplete */}

      <p type="Parent/Partner">
        <input
          id="parentInputC"
          placeholder="Name of Parent/ Partner"
          list="parentSearchDataList"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("toggle-slide").focus();
            }
          }}
        ></input>
        <datalist id="parentSearchDataList"></datalist>
      </p>

      <div className="radio-togglesC">
        <p>Child</p>
        <input
          type="checkbox"
          id="toggle-slide"
          onChange={() => {
            console.log("Changed Radio!");
            inputChangedHandler();
          }}
          name="radio-optionsC"
        />
        <p> Partner</p>
      </div>
      <button type="button" id="save" onClick={submit}>
        Save Changes
      </button>
      <button
        type="button"
        id="cancel"
        onClick={() => {
          try {
            document.getElementsByClassName("Create")[0].style.display = "none";
            document.getElementById("Modal").style.display = "none";
          } catch {}
        }}
      >
        Cancel
      </button>
    </div>
  );
}
export default Create;
