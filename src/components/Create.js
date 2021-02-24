import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

function Create(props) {
  const [cookies] = useCookies(["author"]);

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
    node.parentNode = $("#parentInputC").val();
    let pid = document.getElementById("toggle-slide").checked,
      isPartner = 0;
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
      generation: $("#genInputC").val(),
      name: $("#nameInputC").val(),
      birthdate: $("#birthdateInputC").val(),
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
      $("div.Create").css("display", "none");
      $("#Modal").css("display", "none");
    } catch {}

    setTimeout(() => {
      props.update();
    }, 500);
  };

  const validation = () => {
    let nameinput = $("#nameInputC");
    let parentInputC = $("#parentInputC");
    let check1,
      check2 = false;

    //check child or partner
    if (document.getElementById("toggle-slide").checked) node.isPartner = 1;

    if (node.isPartner === 1 && whitespace(parentInputC.val()).length < 1) {
      check1 = false;
      parentInputC.css("border-bottom", "2px solid red");
      parentInputC.attr(
        "placeholder",
        "This field cant be empty when partner is chosen"
      );
    } else {
      check1 = true;
    }
    if (whitespace(nameinput.val())) {
      whitespace(node.generation);
      whitespace(node.name);
      whitespace(node.birthdate);
      whitespace(node.parent);
      whitespace(node.partner);
      setsendNode(node);
      check2 = true;
    } else {
      //empty, apply error styles
      nameinput.css("border-bottom", "2px solid red");
      nameinput.attr("placeholder", "Name cannot be empty");
    }
    if (check1 && check2) {
      return true;
    }
  };

  function checkParent() {
    let element = $("#parentInputC");
    for (const x of props.data) {
      let namecheck = x.generation + " " + x.name;
      if (element.val() === namecheck) return true;
      if (x.name === element.val()) return true;
    }
    if ($.trim(element.val()) === "") return true;
    element.css("border-bottom", "2px solid red");
    element.val("");
    element.attr("placeholder", "invalid parent: click from list");
    return false;
  }

  const submit = () => {
    inputChangedHandler();
    if (node.isPartner === 0) {
      node.parent = node.parentNode;
    }
    setTimeout(() => {
      if (validation() && checkParent()) {
        Axios.post("http://localhost:5000/api/insert", {
          input: sendNode,
          author: cookies.author,
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
            inputChangedHandler();
          }}
          name="radio-optionsC"
        />
        <p> Partner</p>
      </div>
      <button type="button" id="save" className="create-button" onClick={submit}>
        Save Changes
      </button>
      <button
        type="button"
        id="cancel"
        className="create-button"
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
