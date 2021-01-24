import React, { useState } from "react";
import "../css/Edit.css";
import Axios from "axios";
import * as $ from "jquery";

export default function Edit(props) {
  const [changed, setChanged] = useState(false);
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
      partner = document.getElementById("parentInput").value;
    } else {
      parent = document.getElementById("parentInput").value;
    }

    try {
      pid = props.getPID(document.getElementById("parentInput").value);
    } catch {
      pid = 0;
    }

    setNodeInput({
      id: props.nodedata.id,
      generation: document.getElementById("genInput").value,
      name: document.getElementById("name").value,
      birthdate: document.getElementById("birthdate").value,
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
    setChanged(false);
    if (
      document.getElementById("genInput").value !== props.nodedata.generation
    ) {
      setChanged(true);
    }
    if (document.getElementById("name").value !== props.nodedata.name) {
      setChanged(true);
    }
    if (
      document.getElementById("birthdate").value !== props.nodedata.birthdate
    ) {
      setChanged(true);
    }
    // eslint-disable-next-line
    if (document.getElementById("parentInput").value != props.nodedata.pid) {
      setChanged(true);
    }
    // case "option-1":
    //   element = document.getElementById(id).checked;
    //   if (element === true && props.nodadata.savedTags === "partner") {
    //     setChanged(true);
    //     return true;
    //   }
    //   break;
    // case "option-2":
    //   element = document.getElementById(id).checked;
    //   if (element === true && props.nodadata.savedTags !== "partner") {
    //     setChanged(true);
    //     return true;
    //   }
    if (getRadioVal === "partner" && props.nodedata.isPartner !== 1) {
      setChanged(true);
    }
    if (getRadioVal === "child" && props.nodedata.isPartner !== 0) {
      setChanged(true);
    }
  }

  function checkParent() {
    let element = document.getElementById("parentInput");
    for (const x of props.data) {
      if (element.value === x.name) {
        return true;
      }
    }
    if ($.trim(element.value) === "") return true;
    return false;
  }

  function saveEdit() {
    let check = false;
    check = checkParent();
    console.log(`changed=${changed}  checkParent=${check}`);
    if (changed === true && check) {
      //save
      console.log(nodeInput)
      Axios.put("https://cors-anywhere.herokuapp.com/https://layfamily.herokuapp.com/api/update", {
        id: nodeInput.id,
        generation: nodeInput.generation,
        name: nodeInput.name,
        birthdate: nodeInput.birthdate,
        pid: nodeInput.pid,
        isPartner: nodeInput.isPartner,
        parent: nodeInput.parent,
        partner: nodeInput.partner,
      }).then(closeEditMenu());
    } else {
      //alert no changes made
      console.log("error, no changes made");
    }
    setChanged(false);
  }
  var closeEditMenu = () => {
    document.getElementById("editForm").style.display = "none";
    document.getElementById("Modal").style.display = "none";
    //wait for Axios update then update
    setTimeout(() => {
      props.update();
    }, 200);
  };

  function cancelDeleteConfirm() {
    document.getElementById("deleteConfirmMenu").style.display = "none";
    document.getElementById("editForm").style.display = "block";
  }
  function confirmDeletion() {
    let userValidation = document.getElementById("deleteTextbox");

    if (userValidation.value === "confirm") {
      //delete node
      Axios.post("https://cors-anywhere.herokuapp.com/https://layfamily.herokuapp.com/api/delete", {
        id: props.nodedata.id,
      });

      cancelDeleteConfirm();
      closeEditMenu();
    } else {
      userValidation.style.borderBottom = "2px solid red";
      userValidation.value = "";
      userValidation.placeholder = "input doesn't match, try again";
    }
  }

  var deleteNode = () => {
    //hide edit menu
    document.getElementById("editForm").style.display = "none";
    //show confirm menu and reset default values
    let userValidation = document.getElementById("deleteTextbox");

    document.getElementById("deleteConfirmMenu").style.display = "block";
    userValidation.value = "";
    userValidation.placeholder = "type here";
    userValidation.style.borderBottom = "2px solid #bebed2";
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
