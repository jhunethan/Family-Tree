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
    name: "",
    pid: 0,
    isPartner: 0,
  });

  var inputChangedHandler = () => {
    let isPartner = false;
    let partner, parent, pid;
    let deathdate = null;

    CheckInput();
    checkExtraChanges();

    if ($("#isDeceased")[0].checked) deathdate = $("#deathdate-input").val();

    getRadioVal("option-1", "option-2") === "partner"
      ? (isPartner = 1)
      : (isPartner = 0);

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

    let tempnode = {};

    tempnode.maidenname =
      isPartner === 1 ? $.trim($("#maidenname-input").val()) : null;
    tempnode.birthplace = $.trim($("#birthplace-input").val());
    tempnode.location = $.trim($("#location-input").val());
    tempnode.extranames = $.trim($("#extranames-input").val());
    tempnode.fblink = $.trim($("#fblink-input").val());
    tempnode.profession = $.trim($("#profession-input").val());
    tempnode.description = $.trim($("textarea.description-input").val());

    setNodeInput({
      id: props.nodedata.id,
      generation: $("#generation-input").val(),
      name: $("#name-input").val(),
      birthdate: $("#birthdate-input").val(),
      pid: pid,
      deathdate: deathdate,
      isPartner: isPartner,
      parent: parent,
      partner: partner,
      extradetails: tempnode,
    });
  };

  function getRadioVal(radio1, radio2) {
    if (document.getElementById(radio1).checked === true) return "child";
    if (document.getElementById(radio2).checked === true) return "partner";
  }

  function CheckInput() {
    let changesStack = [],
      opStack = ["generation", "name", "birthdate"];
    let data = props.nodedata;

    setChanges("");
    setChanged(false);

    for (const x of opStack) {
      if (data[x] !== $(`#${x}-input`).val()) {
        changesStack.push(x);
        setExtrachanged(true);
      }
    }

    //deal with empty string compared to null type
    let deathdate = !data.deathdate ? "" : data.deathdate;

    if ($("#deathdate-input").val() !== deathdate) {
      setChanged(true);
      changesStack.push("deathdate");
    }
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

  // async function inputChangedHandler() {
  //   checkExtraChanges();
  //   //set nodeInput

  //   let node = nodeInput;
  //   let tempnode = {};

  //   tempnode.maidenname = (node.isPartner === 1)
  //     ? $.trim($("#maidenname-input").val())
  //     : null;
  //   tempnode.birthplace = $.trim($("#birthplace-input").val());
  //   tempnode.location = $.trim($("#location-input").val());
  //   tempnode.extranames = $.trim($("#extranames-input").val());
  //   tempnode.fblink = $.trim($("#fblink-input").val());
  //   tempnode.profession = $.trim($("#profession-input").val());
  //   tempnode.description = $.trim($("textarea.description-input").val());
  //   node.extradetails = tempnode;
  //   console.log(tempnode.maidenname)
  //   await setNodeInput(node);
  // }

  const descriptionHandler = () => {
    inputChangedHandler();
    var numOfWords = $("textarea.description-input")
      .val()
      .replace(/^[\s,.;]+/, "")
      .replace(/[\s,.;]+$/, "")
      .split(/[\s,.;]+/).length;
    setdescriptionlimit(numOfWords);
  };

  const checkExtraChanges = () => {
    let arr = [],
      opStack = [
        "birthplace",
        "location",
        "extranames",
        "fblink",
        "profession",
      ];
    let data = props.nodedata.extradetails;
    setExtrachanged(false);

    if (getRadioVal("option-1", "option-2") === "partner") {
      opStack.push("maidenname")
      $("#maidenname-input").css("display", "block");
      $("label.maidenname").css("display", "block");
    }else{
      $("#maidenname-input").css("display", "none");
      $("label.maidenname").css("display", "none");
    }

    try {
      for (const x of opStack) {
        if (data[x] !== $(`#${x}-input`).val()) {
          arr.push(x);
          setExtrachanged(true);
        }
      }
      if (data.description !== $("textarea.description-input").val()) {
        arr.push("description");
        setExtrachanged(true);
      }
    } catch {
      for (const x of opStack) {
        if ($.trim($(`#${x}-input`).val().length) > 0) {
          arr.push(x);
          setExtrachanged(true);
        }
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
            id="generation-input"
            className="extra-details-input"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("name-input").focus();
              }
            }}
          />
        </p>
        <p type="Name:">
          <input
            autoComplete="off"
            id="name-input"
            className="extra-details-input"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("birthdate-input").focus();
              }
            }}
          />
        </p>
        <p type="Date of Birth">
          <input
            id="birthdate-input"
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
              $("#deathdate-input").css(
                "display",
                e.target.checked ? "block" : "none"
              );
              $("#deathdate-input").val(
                e.target.checked ? props.nodedata.deathdate : null
              );
              inputChangedHandler();
            }}
          />
          <input
            id="deathdate-input"
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
          />
          <datalist id="parentSearchDataList"></datalist>
        </p>
        <div className="radio-toggles">
          <input
            autoComplete="off"
            onClick={(event) => props.switchRadio(event.target)}
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
            onClick={(event) => props.switchRadio(event.target)}
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
        <label
          htmlFor="maidenname-input"
          className="extra-details-label maidenname"
        >
          Maiden name
        </label>
        <input
          autoComplete="off"
          type="text"
          name="maidenname-input"
          id="maidenname-input"
          className="extra-details-input"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("extranames-input").focus();
            }
          }}
        />
        <label htmlFor="birthplace-input" className="extra-details-label">
          Place of Birth
        </label>
        <input
          autoComplete="off"
          type="text"
          name="birthplace-input"
          id="birthplace-input"
          className="extra-details-input"
          onChange={inputChangedHandler}
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
          onChange={inputChangedHandler}
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
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("fblink-input").focus();
            }
          }}
        />
        <label htmlFor="fblink-input" className="extra-details-label">
          Facebook Link
        </label>
        <input
          autoComplete="off"
          type="text"
          name="fblink-input"
          id="fblink-input"
          className="extra-details-input"
          onChange={inputChangedHandler}
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
          onChange={inputChangedHandler}
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
