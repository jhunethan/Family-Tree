import React, { useState } from "react";
import "../css/Edit.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

export default function Edit(props) {
  const [cookies] = useCookies(["author"]);
  const [changed, setChanged] = useState(false);
  const [changes, setChanges] = useState("");
  const [extrachanges, setExtrachanges] = useState("");
  const [extrachanged, setExtrachanged] = useState(false);
  const [descriptionlimit, setdescriptionlimit] = useState(0);
  const [nodeInput, setNodeInput] = useState({
    id: props.nodedata.id,
    generation: "",
    name: "",
    birthdate: "",
    pid: 0,
    isPartner: 0,
    parent: "",
    partner: "",
    location: "",
    extranames: "",
    fblink: "",
    description: "",
  });

  var inputChangedHandler = () => {
    let isPartner = false;
    let partner, parent, pid;
    let deathdate = null;

    if ($("#isDeceased")[0].checked) deathdate = $("#deathdate").val();

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

    if (pid === 0 || !pid) isPartner = 0;

    setNodeInput({
      id: props.nodedata.id,
      generation: $("#genInput").val(),
      name: $("#name").val(),
      birthdate: $("#birthdate").val(),
      pid: pid,
      deathdate: deathdate,
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
      !props.nodedata.partner
    ) {
      setChanged(true);
      changesStack.push("parent-node");
    }
    if (
      $("#parentInput").val() !== props.nodedata.partner &&
      !props.nodedata.parent
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
    //deal with empty string compared to null type
    let deathdate =
      props.nodedata.deathdate === null ? "" : props.nodedata.deathdate;
    if ($("#deathdate").val() !== deathdate) {
      setChanged(true);
      changesStack.push("deathdate");
    }
    setChanges(changesStack.join(","));
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
    element.attr("placeholder", "invalid parent: click from list");
    return false;
  }

  function saveEdit() {
    if (changed === true && checkParent()) {
      //save
      Axios.post("http://localhost:5000/api/update", {
        input: nodeInput,
        name: props.nodedata.name,
        author: cookies.author,
        changes: changes,
      });
    }
    extraInputHandler();
    if (extrachanged) {
      Axios.post("http://localhost:5000/api/updateextra", {
        id: props.nodedata.id,
        name: props.nodedata.name,
        input: nodeInput,
        author: cookies.author,
        changes: extrachanges,
      });
    }

    if (extrachanged || (changed === true && checkParent())) closeEditMenu();
    setChanged(false);
    setExtrachanged(false);
  }

  const closeEditMenu = (param) => {
    $("#editForm").css("display", "none");
    $("#Modal").css("display", "none");
    $("div.edit-container").css("display", "none");
    $("#card-container").css("display", "none");
    //send new node update
    if (param === "unsave") return;
    let node;
    if (!nodeInput.id) {
      node = props.nodedata;
      node.extradetails = nodeInput.extradetails;
    } else {
      node = nodeInput;
    }
    props.update(node);
  };

  function cancelDeleteConfirm() {
    $("#deleteConfirmMenu").css("display", "none");
    $("#editForm").css("display", "block");
  }

  function confirmDeletion() {
    let userValidation = $("#deleteTextbox");
    let node = props.nodedata;
    node.method = "delete";
    if (userValidation.val() === "confirm") {
      //delete node
      Axios.post("http://localhost:5000/api/delete", {
        id: props.nodedata.id,
        name: props.nodedata.name,
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

  async function extraInputHandler() {
    checkExtraChanges();
    //set nodeInput
    let node = nodeInput;
    let tempnode = {};
    tempnode.birthplace = $.trim($("#birthplace-input").val());
    tempnode.location = $.trim($("#location-input").val());
    tempnode.extranames = $.trim($("#extranames-input").val());
    tempnode.fblink = $.trim($("#fblink-input").val());
    tempnode.profession = $.trim($("#profession-input").val());
    tempnode.description = $.trim($("textarea.description-input").val());
    node.extradetails = tempnode;
    await setNodeInput(node);
  }

  const descriptionHandler = () => {
    extraInputHandler();
    var numOfWords = $("textarea.description-input")
      .val()
      .replace(/^[\s,.;]+/, "")
      .replace(/[\s,.;]+$/, "")
      .split(/[\s,.;]+/).length;
    setdescriptionlimit(numOfWords);
  };

  const checkExtraChanges = () => {
    let arr = [];
    setExtrachanged(false);
    try {
      if (
        props.nodedata.extradetails.birthplace !== $("#birthplace-input").val()
      ) {
        arr.push("birthplace");
        setExtrachanged(true);
      }
      if (props.nodedata.extradetails.location !== $("#location-input").val()) {
        arr.push("location");
        setExtrachanged(true);
      }
      if (
        props.nodedata.extradetails.extranames !== $("#extranames-input").val()
      ) {
        arr.push("extranames");
        setExtrachanged(true);
      }
      if (props.nodedata.extradetails.fblink !== $("#fblink-input").val()) {
        arr.push("fblink");
        setExtrachanged(true);
      }
      if (
        props.nodedata.extradetails.profession !== $("#profession-input").val()
      ) {
        arr.push("profession");
        setExtrachanged(true);
      }
      if (
        props.nodedata.extradetails.description !==
        $("textarea.description-input").val()
      ) {
        arr.push("description");
        setExtrachanged(true);
      }
    } catch {
      if ($("#birthplace-input").val().length > 0) {
        arr.push("birthplace");
        setExtrachanged(true);
      }
      if ($("#location-input").val().length > 0) {
        arr.push("location");
        setExtrachanged(true);
      }
      if ($("#extranames-input").val().length > 0) {
        arr.push("extranames");
        setExtrachanged(true);
      }
      if ($("#fblink-input").val().length > 0) {
        arr.push("fblink");
        setExtrachanged(true);
      }
      if ($("#profession-input").val().length > 0) {
        arr.push("profession");
        setExtrachanged(true);
      }
      if ($("textarea.description-input").val().length > 0) {
        arr.push("description");
        setExtrachanged(true);
      }
    }
    setExtrachanges(arr.join(","));
  };

  return (
    <div id="Edit">
      <div id="editForm" className="form">
        <h2 className="edit-header">Edit Details</h2>
        <button type="submit" id="deleteNode" onClick={deleteNode}>
          Delete
        </button>
        <p type="Generation">
          <input
          autoComplete="off"
            id="genInput"
            className="extra-details-input"
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
          autoComplete="off"
            id="name"
            className="extra-details-input"
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
            type="date"
            className="extra-details-input"
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
        <p type="Date of death">
          <label htmlFor="isDeceased">Has this person died?</label>
          <input
            id="isDeceased"
            type="checkbox"
            name="isDeceased"
            onClick={(e) => {
              $("#deathdate").css(
                "display",
                e.target.checked ? "block" : "none"
              );
              $("#deathdate").val(
                e.target.checked ? props.nodedata.deathdate : null
              );
              inputChangedHandler();
            }}
          />
          <input
            id="deathdate"
            type="date"
            className="extra-details-input"
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
          autoComplete="off"
            id="parentInput"
            className="extra-details-input"
            placeholder="Name of Parent/ Partner"
            list="parentSearchDataList"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("birthplace-input").focus();
              }
            }}
          ></input>
          <datalist id="parentSearchDataList"></datalist>
        </p>
        <div className="radio-toggles">
          <input
          autoComplete="off"
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
          autoComplete="off"
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
        <label htmlFor="birthplace-input" className="extra-details-label">
          Place of Birth
        </label>
        <input
        autoComplete="off"
          type="text"
          name="birthplace-input"
          id="birthplace-input"
          className="extra-details-input"
          onChange={extraInputHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("location-input").focus();
            }
          }}
        />
        <label htmlFor="location-input" className="extra-details-label">
          Current Location
        </label>
        <input
        autoComplete="off"
          type="text"
          name="location-input"
          id="location-input"
          className="extra-details-input"
          onChange={extraInputHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("extranames-input").focus();
            }
          }}
        />
        <label htmlFor="extranames-input" className="extra-details-label">
          Additional Names
        </label>
        <input
        autoComplete="off"
          type="text"
          name="extranames-input"
          id="extranames-input"
          className="extra-details-input"
          onChange={extraInputHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("fblink-input").focus();
            }
          }}
        />{" "}
        <label htmlFor="fblink-input" className="extra-details-label">
          Facebook Link
        </label>
        <input
        autoComplete="off"
          type="text"
          name="fblink-input"
          id="fblink-input"
          className="extra-details-input"
          onChange={extraInputHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementsByClassName("profession-input")[0].focus();
            }
          }}
        />
        <label htmlFor="profession-input" className="extra-details-label">
          Profession
        </label>
        <input
        autoComplete="off"
          type="text"
          name="profession-input"
          id="profession-input"
          className="extra-details-input"
          onChange={extraInputHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementsByClassName("description-input")[0].focus();
            }
          }}
        />
        <label htmlFor="description-input" className="extra-details-label">
          Description ( {descriptionlimit}/250 words )
        </label>
        <textarea
          type="text"
          name="description-input"
          className="extra-details-input description-input"
          placeholder="description up to 250 words..."
          onChange={descriptionHandler}
        />
        <button type="button" id="save" onClick={saveEdit}>
          Save Changes
        </button>
        <button
          type="button"
          id="cancel"
          onClick={() => closeEditMenu("unsave")}
        >
          Cancel
        </button>
      </div>

      <div id="deleteConfirmMenu" className="form">
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
        ></input>
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
