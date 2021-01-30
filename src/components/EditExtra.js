import React, { useState } from "react";
import Axios from "axios";
import * as $ from "jquery";

import "../css/EditExtra.css";

export default function EditExtra(props) {
  const [descriptionlimit, setdescriptionlimit] = useState(0);
  const [nodeInput, setNodeInput] = useState({
    location: "",
    extranames: "",
    fblink: "",
    description: "",
  });

  const inputHandler = () => {
    //get
    let location = $("#location-input").val();
    let extranames = $("#extranames-input").val();
    let fblink = $("#fblink-input").val();
    let description = $("textarea.description-input").val();
    //set nodeInput
    setNodeInput({
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

  const submit = () => {
    let id = props.currentNode.id;
    inputHandler();
    console.log(id)
    console.log(nodeInput);
    Axios.post("https://layfamily.herokuapp.com/api/updateextra", {
      id: id,
      location: nodeInput.location,
      extranames: nodeInput.extranames,
      fblink: nodeInput.fblink,
      description: nodeInput.description,
    }); //.then(closeEditMenu())
  };

  return (
    <div className="edit-container">
      <h1 className="form-header">
        Further Details <br />
        {props.currentNode.generation} {props.currentNode.name}
      </h1>
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
