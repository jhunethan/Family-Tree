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

  const inputChangedHandler = () => {
    //set unique insert ID
    let idArray = [],
      id = 1;

    for (let i = 0; i < props.data.length; i++) {
      idArray.push(props.data[i].id);
    }
    while (idArray.includes(id)) {
      id += 1;
    }

    //if parent field is populated, show relationship

    $(".radio-togglesC").css(
      "display",
      $.trim($("#parentInputC").val()) ? "flex" : "none"
    );

    //if parent field, populate Create-Datalist
    //filter by input
    let list = $("#Create-Datalist").html(""),
      datalistcount = 0,
      filteredDatalist = [];

    if ($.trim($("#parentInputC").val())) {
      for (const x of props.data) {
        if (x.name && datalistcount < 5) {
          filteredDatalist.push(`${x.generation} ${x.name}`);
        }
      }

      let parsed = $.trim($("#parentInputC").val().toLowerCase()).split(" ");
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
      $("div.Create").css("display", "none");
      $("#Modal").css("display", "none");
    } catch {}

    let node = sendNode;
    node.method = "create";
    props.update(node);
  };

  const validation = () => {
    let nameinput = $("#nameInputC");
    let parentInputC = $("#parentInputC");
    let check = true;

    //check child or partner
    if (document.getElementById("toggle-slide").checked) node.isPartner = 1;

    if (node.isPartner === 1 && whitespace(parentInputC.val()).length < 1) {
      check = false;
      parentInputC.css("border-bottom", "2px solid red");
      parentInputC.attr(
        "placeholder",
        "This field cant be empty when partner is chosen"
      );
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
    if (validation()) {
      Axios.post("https://layfamily.herokuapp.com/api/insert", {
        input: sendNode,
        author: cookies.author,
      }).then(successAdd());
    }
  };

  return (
    <div className="Create">
      <h2>Add New</h2>
      <p type="Generation">
        <input
          autoComplete="off"
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
          autoComplete="off"
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
          autoComplete="off"
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
          autoComplete="off"
          id="parentInputC"
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
        id="Create-Datalist"
        onClick={(e) => {
          try {
            $("#parentInputC").val($.trim(e.target.closest("li").textContent));
          } catch {}
        }}
      ></ul>

      <div className="radio-togglesC">
        <p className="create-radio-option">Parent</p>
        <input
          type="checkbox"
          className="create-checkbox"
          id="toggle-slide"
          onChange={() => {
            inputChangedHandler();
          }}
          name="radio-optionsC"
        />
        <p className="create-radio-option"> Partner</p>
      </div>
      <button
        type="button"
        id="save"
        className="create-button"
        onClick={submit}
      >
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
