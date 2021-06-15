import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

function Create(props) {
  const [cookies] = useCookies(["author"]);

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

  const [sendNode, setsendNode] = useState(node);

  const populateDatalist = () => {
    //filter by input
    let list = $("#create-datalist").html(""),
      datalistcount = 0,
      filteredDatalist = [];

    if ($.trim($("#create-parent-input").val())) {
      for (const x of props.data) {
        if (x.name && datalistcount < 5) {
          filteredDatalist.push(`${x.generation} ${x.name}`);
        }
      }

      let parsed = $.trim($("#create-parent-input").val().toLowerCase()).split(
        " "
      );
      filteredDatalist = filteredDatalist.filter((x) => {
        for (const word of parsed) {
          if (!x.toLowerCase().includes(word)) return false;
        }
        return true;
      });

      for (const n of filteredDatalist) {
        if (datalistcount < 5) {
          list.append(`<li>${n}</li>`);
          datalistcount += 1;
        }
      }
    }
  };

  const getUniqueID = (data) => {
    //set unique insert ID
    let idArray = [],
      id = 1;

    for (let i = 0; i < data.length; i++) {
      idArray.push(data[i].id);
    }
    while (idArray.includes(id)) {
      id += 1;
    }
    return id;
  };

  const inputChangedHandler = () => {
    let parentInput = $("#create-parent-input").val();
    let id = getUniqueID(props.data);
    let isPartner = document.getElementById("toggle-slide").checked;
    let pid = null;

    if (!parentInput) isPartner = false;

    if (!isPartner) {
      node.parent = parentInput;
      isPartner = 0;
    } else {
      node.partner = parentInput;
      isPartner = 1;
    }

    try {
      pid = props.getPID(parentInput);
    } catch {
      pid = 0;
    }

    //if parent field is populated, show relationship

    $(".create-form-relationship").css(
      "display",
      $.trim($("#create-parent-input").val()) ? "flex" : "none"
    );

    populateDatalist();

    setsendNode({
      id: id,
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
    if (!str) return "";
    return $.trim(str);
  };

  const successAdd = () => {
    try {
      $("div.create-form").css("display", "none");
      $("#Modal").css("display", "none");
    } catch {}

    let node = sendNode;
    node.method = "create";
    props.update(node);
  };

  const validation = () => {
    let nameinput = $("#nameInputC");
    let parentInput = $("#create-parent-input");
    let check = true;

    //check child or partner
    if (document.getElementById("toggle-slide").checked) node.isPartner = 1;

    if (node.isPartner && !whitespace(parentInput.val()).length) {
      document.getElementById("toggle-slide").checked = false;
      node.isPartner = 0;
    }
    if (!whitespace(nameinput.val())) {
      //empty, apply error styles
      nameinput.css("border-bottom", "2px solid red");
      nameinput.attr("placeholder", "Name cannot be empty");
      check = false;
    }

    if (!checkParent()) check = false;

    return check;
  };

  function checkParent() {
    let element = $("#create-parent-input");
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
    if (validation()) {
      Axios.post("https://apilayfamilytree.com/api/familymembers", {
        input: sendNode,
        author: cookies.author,
      }).then(successAdd());
    }
  };

  return (
    <div className="create-form">
      <h2 className="create-form-title">Add New</h2>
      <p type="Generation Name" className="create-form-section">
        <input
          autoComplete="off"
          id="genInputC"
          className="create-form-input"
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
      <p type="Name:" className="create-form-section">
        <input
          autoComplete="off"
          id="nameInputC"
          className="create-form-input"
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
      <p type="Date of Birth" className="create-form-section">
        <input
          autoComplete="off"
          type="date"
          id="birthdateInputC"
          className="create-form-input"
          onChange={inputChangedHandler}
          placeholder="YYYY-MM-DD"
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("create-parent-input").focus();
            }
          }}
        />
      </p>

      {/* Search for parent autocomplete */}

      <p type="Parent/Partner" className="create-form-section">
        <input
          autoComplete="off"
          id="create-parent-input"
          className="create-form-input"
          placeholder="Name of Parent/ Partner"
          onChange={inputChangedHandler}
          onClick={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("toggle-slide").focus();
            }
          }}
        ></input>
      </p>
      <ul
        className="datalist-ul"
        id="create-datalist"
        onClick={(e) => {
          try {
            $("#create-parent-input").val(
              $.trim(e.target.closest("li").textContent)
            );
            inputChangedHandler();
          } catch {}
        }}
      ></ul>
      <div className="create-form-relationship">
        <p className="create-form-radio-option">Parent</p>
        <input
          type="checkbox"
          className="create-form-checkbox"
          id="toggle-slide"
          onChange={() => {
            inputChangedHandler();
          }}
          name="radio-optionsC"
        />
        <p className="create-form-radio-option">Partner</p>
      </div>
      <button
        type="button"
        id="save"
        className="create-form-button"
        onClick={submit}
      >
        Save Changes
      </button>
      <button
        type="button"
        id="cancel"
        className="create-form-button"
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
