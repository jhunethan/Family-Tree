import React, { useState } from "react";
import Axios from "axios";
import * as $ from "jquery";

import "../css/EditExtra.css";

export default function EditExtra(props) {
  const [descriptionlimit, setdescriptionlimit] = useState(0);
  const [changes, setchanges] = useState("");
  const [changed, setChanged] = useState(false);
  const [nodeInput, setNodeInput] = useState({
    location: "",
    extranames: "",
    fblink: "",
    description: "",
  });

  const checkChanges = () => {
    let arr = [];
    setChanged(false);
    try {
      if (
        props.currentNode.extradetails.birthplace !==
        $("#birthplace-input").val()
      ) {
        arr.push("birthplace");
        setChanged(true);
      }
      if (
        props.currentNode.extradetails.location !== $("#location-input").val()
      ) {
        arr.push("location");
        setChanged(true);
      }
      if (
        props.currentNode.extradetails.extranames !==
        $("#extranames-input").val()
      ) {
        arr.push("extranames");
        setChanged(true);
      }
      if (props.currentNode.extradetails.fblink !== $("#fblink-input").val()) {
        arr.push("fblink");
        setChanged(true);
      }
      if (
        props.currentNode.extradetails.description !==
        $("textarea.description-input").val()
      ) {
        arr.push("description");
        setChanged(true);
      }
    } catch {
      if ($("#birthplace-input").val().length > 0) {
        arr.push("birthplace");
        setChanged(true);
      }
      if ($("#location-input").val().length > 0) {
        arr.push("location");
        setChanged(true);
      }
      if ($("#extranames-input").val().length > 0) {
        arr.push("extranames");
        setChanged(true);
      }
      if ($("#fblink-input").val().length > 0) {
        arr.push("fblink");
        setChanged(true);
      }
      if ($("textarea.description-input").val().length > 0) {
        arr.push("description");
        setChanged(true);
      }
    }
    console.log(arr.join(","));
    setchanges(arr.join(","));
  };

  const inputHandler = () => {
    checkChanges();
    //get
    let birthplace = $.trim($("#birthplace-input").val());
    let location = $.trim($("#location-input").val());
    let extranames = $.trim($("#extranames-input").val());
    let fblink = $.trim($("#fblink-input").val());
    let description = $.trim($("textarea.description-input").val());
    //set nodeInput
    setNodeInput({
      birthplace: birthplace,
      location: location,
      extranames: extranames,
      fblink: fblink,
      description: description,
    });
  };

  const descriptionHandler = () => {
    inputHandler();
    var numOfWords = $("textarea.description-input")
      .val()
      .replace(/^[\s,.;]+/, "")
      .replace(/[\s,.;]+$/, "")
      .split(/[\s,.;]+/).length;
    setdescriptionlimit(numOfWords);
  };

  const closeEditMenu = () => {
    $("#edit-container").css("display", "none");
  };

  const submit = () => {
    let id = props.currentNode.id;
    inputHandler();
    if (changed) {
      Axios.post("http://localhost:5000/api/updateextra", {
        id: id,
        birthplace: nodeInput.birthplace,
        location: nodeInput.location,
        extranames: nodeInput.extranames,
        fblink: nodeInput.fblink,
        description: nodeInput.description,
        author: "default author",
        changes: changes,
      }).then(closeEditMenu());
    } else {
      alert("no further details changes detected");
    }
  };

  return (
    <div className="edit-container">
      <h1 className="form-header">Extra Details</h1>
      <label htmlFor="birthplace-input" className="extra-details-label">
        Place of Birth
      </label>
      <input
        type="text"
        name="birthplace-input"
        id="birthplace-input"
        className="extra-details-input"
        onChange={inputHandler}
      />
      <label htmlFor="location-input" className="extra-details-label">
        Current Location
      </label>
      <input
        type="text"
        name="location-input"
        id="location-input"
        className="extra-details-input"
        onChange={inputHandler}
      />
      <label htmlFor="extranames-input" className="extra-details-label">
        Additional Names
      </label>
      <input
        type="text"
        name="extranames-input"
        id="extranames-input"
        className="extra-details-input"
        onChange={inputHandler}
      />{" "}
      <label htmlFor="fblink-input" className="extra-details-label">
        Facebook Link
      </label>
      <input
        type="text"
        name="fblink-input"
        id="fblink-input"
        className="extra-details-input"
        onChange={inputHandler}
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
      <button className="edit-container-submit" type="submit" onClick={submit}>
        Submit
      </button>
    </div>
  );
}
