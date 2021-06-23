import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

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

  const [activeParentInput, setActiveParentInput] = useState(null)
  const [sendNode, setsendNode] = useState(node);

  const getValidBirthdate = () => {
    const day = $("#create-birthdate-dd").val();
    const month = $("#create-birthdate-mm").val();
    const year = $("#create-birthdate-yyyy").val();

    if (!day || !month || !year) return "";

    if ((+day < 1 && +day > 31) || day.length > 2) {
      toast.error("invalid birthdate: day must be a valid number");
      return "";
    }
    if ((+month < 1 && +month > 12) || day.length > 2) {
      toast.error("invalid birthdate: month must be a valid number");
      return "";
    }
    if (+year < 1 || day.length > 4) {
      toast.error("invalid birthdate: month must be a valid number");
      return "";
    }

    return `${year}-${month}-${day}`;
  };

  const populateDatalist = () => {
    //filter by input
    let list = $("#create-datalist").html(""),
      datalistcount = 0,
      filteredDatalist = [];
    const userInput = $(activeParentInput).val()
    if ($.trim(userInput)) {
      for (const x of props.data) {
        if (x.name && datalistcount < 5) {
          filteredDatalist.push(`${x.generation} ${x.name}`);
        }
      }

      let parsed = $.trim(userInput.toLowerCase()).split(
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
          datalistcount ++;
        }
      }
      if(datalistcount === 0) list.append('<li>No Results Found...</li>')
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
    const parentInput = $("#create-parent-input").val();
    const secondParentInput = $("#create-second-parent-input").val();
    const id = getUniqueID(props.data);
    let isPartner = document.getElementById("toggle-slide").checked;
    let pid = null;

    if (!parentInput) isPartner = false;

    if (!isPartner) {
      node.parent = parentInput;
      node.secondPartner = secondParentInput;
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

    const birthdate = getValidBirthdate();

    setsendNode({
      id: id,
      generation: $("#genInputC").val(),
      name: $("#nameInputC").val(),
      birthdate: birthdate,
      pid: pid,
      isPartner: isPartner,
      parent: node.parent,
      partner: node.partner,
      secondPartner: node.secondPartner
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

    if (!checkParent("#create-parent-input")) check = false;
    if (!checkParent("#create-second-parent-input")) check = false;
    return check;
  };

  function checkParent(id) {
    let element = $(id);
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
              document.getElementById("create-birthdate-dd").focus();
            }
          }}
        />
      </p>

      <label htmlFor="create-birthdate">Date of Birth</label>

      <div className="birthdate-input-container" name="create-birthdate">
        <input
          className="birthdate-input"
          type="number"
          name="birthdate-dd"
          id="create-birthdate-dd"
          placeholder="dd"
          min="1"
          max="31"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === "Enter" || event.target.value.length === 2) {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("create-birthdate-mm").focus();
            }
          }}
        />
        <input
          className="birthdate-input"
          type="number"
          name="birthdate-mm"
          min="1"
          max="12"
          id="create-birthdate-mm"
          placeholder="mm"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === "Enter" || event.target.value.length === 2) {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("create-birthdate-yyyy").focus();
            }
          }}
        />
        <input
          className="birthdate-input"
          type="number"
          name="birthdate-yyyy"
          id="create-birthdate-yyyy"
          placeholder="yyyy"
          min="1"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === "Enter" || event.target.value.length === 4) {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("create-parent-input").focus();
            }
          }}
        />
      </div>

      {/* Search for parent autocomplete */}

      <p type="First Parent" className="create-form-section">
        <input
          autoComplete="off"
          id="create-parent-input"
          className="create-form-input"
          placeholder="Full Name of First Parent"
          onChange={()=>{inputChangedHandler();
            setActiveParentInput("#create-parent-input")}}
          onClick={()=>{inputChangedHandler();
          setActiveParentInput("#create-parent-input")}}
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
      <p type="Second Parent" className="create-form-section">
        <input
          autoComplete="off"
          id="create-second-parent-input"
          className="create-form-input"
          placeholder="Full Name of Second Parent"
          onChange={()=>{inputChangedHandler();
            setActiveParentInput("#create-second-parent-input")}}
          onClick={()=>{inputChangedHandler();
          setActiveParentInput("#create-second-parent-input")}}
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
            const text = $.trim(e.target.closest("li").textContent)
            if(text !== 'No Results Found...')
            $(activeParentInput).val(text);
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
            $(".create-form").css("display", "none");
            $("#Modal").css("display", "none");
          } catch (err) {
            console.log(err);
          }
        }}
      >
        Cancel
      </button>
    </div>
  );
}
export default Create;
