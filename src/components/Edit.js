import React, { useState } from "react";
import "../css/Edit.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

export default function Edit(props) {
  const [cookies] = useCookies(["author"]);
  const [changed, setChanged] = useState(false);
  const [changes, setChanges] = useState("");
  const [nodeInput, setNodeInput] = useState({
    id: 0,
    generation: "",
    name: "",
    birthdate: "",
    pid: 0,
    isPartner: 0,
    parent: "",
    partner: "",
  });

  var inputChangedHandler = () => {
    let isPartner = false;
    let partner, parent, pid;
    getRadioVal("option-1", "option-2") === "partner"
      ? (isPartner = 1)
      : (isPartner = 0);
    CheckInput();

    if (isPartner === 1) {
      partner = $("#parentInput").val();
    } else {
      parent = $("#parentInput").val();
    }

    try {
      pid = props.getPID($("#parentInput").val());
    } catch {
      pid = 0;
    }

    setNodeInput({
      id: props.nodedata.id,
      generation: $("#genInput").val(),
      name: $("#name").val(),
      birthdate: $("#birthdate").val(),
      pid: pid,
      isPartner: isPartner,
      parent: parent,
      partner: partner,
    });
  };

  function getRadioVal(radio1, radio2) {
    if (document.getElementById(radio1).checked === true) return "child";
    if (document.getElementById(radio2).checked === true) return "partner";
  }

  function CheckInput() {
    setChanges("");
    let changesStack = [];
    setChanged(false);
    if ($("#genInput").val() !== props.nodedata.generation) {
      setChanged(true);
      changesStack.push("generation");
    }
    if ($("#name").val() !== props.nodedata.name) {
      setChanged(true);
      changesStack.push("name");
    }
    if ($("#birthdate").val() !== props.nodedata.birthdate) {
      setChanged(true);
      changesStack.push("birthdate");
    }
    // eslint-disable-next-line
    if (
      $("#parentInput").val() !== props.nodedata.parent &&
      (props.nodedata.partner === null || props.nodedata.partner === "")
    ) {
      setChanged(true);
      changesStack.push("parent-node");
    }
    if (
      $("#parentInput").val() !== props.nodedata.partner &&
      (props.nodedata.parent === null || props.nodedata.parent === "")
    ) {
      setChanged(true);
      changesStack.push("parent-node");
    }
    if (
      getRadioVal("option-1", "option-2") === "partner" &&
      props.nodedata.isPartner !== 1
    ) {
      setChanged(true);
      changesStack.push("isPartner");
    }
    if (
      getRadioVal("option-1", "option-2") === "child" &&
      props.nodedata.isPartner !== 0
    ) {
      setChanged(true);
      changesStack.push("isChild");
    }
    setChanges(changesStack.join(","));
    console.log(changes);
  }

  function checkParent() {
    let element = $("#parentInput");
    for (const x of props.datalist) {
      let namecheck = x.generation + " " + x.name;
      if (element.val() === namecheck) return true;
      if (x.name === element.val()) return true;
    }
    if ($.trim(element.val()) === "") return true;
    element.css("border-bottom", "2px solid red");
    element.val("");
    element.attr("placeholder", "parent not in database");
    return false;
  }

  function saveEdit() {
    let check = false;
    check = checkParent();
    console.log(`changed=${changed}  checkParent=${check}`);
    if (changed === true && check) {
      //save
      Axios.post("http://localhost:5000/api/update", {
        id: nodeInput.id,
        generation: nodeInput.generation,
        name: nodeInput.name,
        birthdate: nodeInput.birthdate,
        pid: nodeInput.pid,
        isPartner: nodeInput.isPartner,
        parent: nodeInput.parent,
        partner: nodeInput.partner,
        author: cookies.author,
        changes: changes,
      }).then(closeEditMenu());
    } else {
      //alert no changes made
      console.log("error, no changes made");
    }
    setChanged(false);
  }
  var closeEditMenu = () => {
    $("#editForm").css("display", "none");
    $("#Modal").css("display", "none");
    $("div.edit-container").css("display", "none");
    $("#card-container").css("display", "none");
    //wait for Axios update then update
    setTimeout(() => {
      props.update();
    }, 200);
  };

  function cancelDeleteConfirm() {
    $("#deleteConfirmMenu").css("display", "none");
    $("#editForm").css("display", "block");
  }
  function confirmDeletion() {
    let userValidation = $("#deleteTextbox");

    if (userValidation.val() === "confirm") {
      //delete node
      Axios.post("http://localhost:5000/api/delete", {
        id: props.nodedata.id,
        author: cookies.author,
      });

      cancelDeleteConfirm();
      closeEditMenu();
    } else {
      userValidation.css("border-bottom", "2px solid red");
      userValidation.val("");
      userValidation.attr("placeholder", "input doesn't match, try again");
    }
  }

  var deleteNode = () => {
    //hide edit menu
    $("#editForm").css("display", "none");
    //show confirm menu and reset default values

    $("#deleteConfirmMenu").css("display", "block");
    $("#deleteTextbox").val("");
    $("#deleteTextbox").attr("placeholder", "type here");
    $("#deleteTextbox").css("border-bottom", "2px solid #bebed2");
  };

  return (
    <div id="Edit">
      <div id="editForm">
        <h2>Edit Details</h2>
        <button type="submit" id="deleteNode" onClick={deleteNode}>
          Delete
        </button>

        <p type="Generation">
          <input
            id="genInput"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("name").focus();
              }
            }}
          />
        </p>
        <p type="Name:">
          <input
            id="name"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("birthdate").focus();
              }
            }}
          />
        </p>
        <p type="Date of Birth">
          <input
            id="birthdate"
            onChange={inputChangedHandler}
            placeholder="YYYY-MM-DD"
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("parentInput").focus();
              }
            }}
          />
        </p>

        {/* Search for parent autocomplete */}

        <p type="Parent/Partner">
          <input
            id="parentInput"
            placeholder="Name of Parent/ Partner"
            list="parentSearchDataList"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                saveEdit();
              }
            }}
          ></input>
          <datalist id="parentSearchDataList"></datalist>
        </p>

        <div className="radio-toggles">
          <input
            onClick={props.switchRadio}
            onChange={inputChangedHandler}
            type="radio"
            id="option-1"
            name="radio-options"
            checked={props.radiochecked}
            value="child"
          />
          <label htmlFor="option-1">Child</label>
          <input
            onClick={props.switchRadio}
            onChange={inputChangedHandler}
            type="radio"
            id="option-2"
            name="radio-options"
            checked={!props.radiochecked}
            value="partner"
          />
          <label htmlFor="option-2">Partner</label>
          <div className="slide-item"></div>
        </div>
        <button type="button" id="save" onClick={saveEdit}>
          Save Changes
        </button>
        <button type="button" id="cancel" onClick={closeEditMenu}>
          Cancel
        </button>
      </div>

      <div id="deleteConfirmMenu">
        <div>
          Are you Sure? <br />
          Type "confirm" below to delete
        </div>
        <input
          type="text"
          autoComplete="off"
          id="deleteTextbox"
          placeholder="type here"
          onKeyUp={(event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Trigger the button element with a click
              confirmDeletion();
            }
          }}
        ></input>{" "}
        <div id="deleteButtonContainer">
          <button type="button" onClick={cancelDeleteConfirm}>
            Cancel
          </button>
          <button type="button" onClick={confirmDeletion}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
