import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

function Create(props) {
  const [cookies] = useCookies(["lay-access"]);
  const { relationship, closePopups, cancelNew, submitNew } = props;

  const node = {
    pid: 0,
    generation: "",
    name: "",
    birthdate: "",
    parent: "",
    partner: "",
    parentNode: "",
    isPartner: 0,
  };

  const [activeParentInput, setActiveParentInput] = useState(null);
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

  const populateDatalist = (override) => {
    const inputId = override ? override : activeParentInput;

    //filter by input
    let list = $("#create-datalist").html(""),
      datalistcount = 0,
      filteredDatalist = [];
    const userInput = $(inputId).val();
    if ($.trim(userInput)) {
      for (const x of props.data) {
        if (x.name && datalistcount < 5) {
          filteredDatalist.push(`${x.generation} ${x.name}`);
        }
      }

      let parsed = $.trim(userInput.toLowerCase()).split(" ");
      filteredDatalist = filteredDatalist.filter((x) => {
        for (const word of parsed) {
          if (!x.toLowerCase().includes(word)) return false;
        }
        return true;
      });

      for (const n of filteredDatalist) {
        if (datalistcount < 5) {
          list.append(`<li>${n}</li>`);
          datalistcount++;
        }
      }
      if (datalistcount === 0) list.append("<li>No Results Found...</li>");
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

    if (!parentInput) {
      node.parent = "";
      node.pid = 0;
    }

    if (!secondParentInput) {
      node.secondParent = undefined;
      node.secondPid = undefined;
    }

    if (checkParent(parentInput)) node.parent = parentInput;
    if (checkParent(secondParentInput)) node.secondParent = secondParentInput;

    try {
      if (node.parent) node.pid = props.getPID(parentInput);
      if (node.secondParent) node.secondPid = props.getPID(secondParentInput);
    } catch {}

    populateDatalist();

    const birthdate = getValidBirthdate();

    if (!node.pid && node.secondPid) {
      node.pid = node.secondPid;
      node.parent = node.secondParent;
      node.secondPid = null;
      node.secondPid = null;
    }

    setsendNode({
      ...node,
      id: id,
      generation: $("#genInputC").val(),
      name: $("#nameInputC").val(),
      birthdate: birthdate,

      isPartner: false,
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
    let check = true;

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
      Axios.post(process.env.REACT_APP_API + "api/familymembers", {
        input: sendNode,
        author: cookies.author,
      }).then(successAdd());
    }
  };

  return (
    <div className="create-form">
      {relationship ? (
        <h2>
          Adding a new {relationship.type} to {relationship.origin}
        </h2>
      ) : (
        <h2 className="create-form-title">Add New</h2>
      )}
      <p type="Generation Name" className="create-form-section">
        <input
          autoComplete="off"
          id="genInputC"
          placeholder="e.g. Hau"
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
      <p type="Name (required)" className="create-form-section">
        <input
          autoComplete="off"
          id="nameInputC"
          placeholder="Full Name Here"
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
              try {
                document.getElementById("create-parent-input").focus();
              } catch {}
            }
          }}
        />
      </div>

      {/* Search for parent autocomplete */}
      {relationship ? (
        <section>
          <div className="two-button-container">
            <button
              type="button"
              id="cancel"
              className="btn btn-outline-primary"
              onClick={() => cancelNew(relationship.newInfo)}
            >
              Cancel
            </button>
            <button
              type="button"
              id="save"
              className="btn btn-primary float-right"
              onClick={() => {
                const metadata = relationship.newInfo;
                const newPerson = {
                  ...sendNode,
                  id: metadata.id,
                  pid: metadata.pid,
                  parent: metadata.parent,
                };
                if (validation()) {
                  submitNew(newPerson);
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </section>
      ) : (
        <section>
          <p type="First Parent" className="create-form-section">
            <input
              autoComplete="off"
              id="create-parent-input"
              className="create-form-input"
              placeholder="Full Name of First Parent"
              onChange={() => {
                inputChangedHandler();
                setActiveParentInput("#create-parent-input");
              }}
              onClick={() => {
                inputChangedHandler();
                setActiveParentInput("#create-parent-input");
              }}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  // Cancel the default action, if needed
                  event.preventDefault();
                  // Focus on next element
                  const suggestion =
                    $("#create-datalist")[0].childNodes[0].textContent;

                  const text = $.trim(suggestion);
                  if (text !== "No Results Found...") {
                    $(activeParentInput).val(text);
                    document
                      .getElementById("create-second-parent-input")
                      .focus();
                    setActiveParentInput(() => {
                      inputChangedHandler();
                      populateDatalist("#create-second-parent-input");
                      return "#create-second-parent-input";
                    });
                  }
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
              onChange={() => {
                inputChangedHandler();
                setActiveParentInput("#create-second-parent-input");
              }}
              onClick={() => {
                inputChangedHandler();
                setActiveParentInput("#create-second-parent-input");
              }}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  // Cancel the default action, if needed
                  event.preventDefault();
                  // Focus on next element
                  const suggestion = $("#create-datalist")[0].childNodes.length
                    ? $("#create-datalist")[0].childNodes[0].textContent
                    : "No Results Found...";

                  const text = $.trim(suggestion);
                  if (text !== "No Results Found...") {
                    $(activeParentInput).val(text);

                    document
                      .getElementById("create-second-parent-input")
                      .blur();
                    document.getElementById(
                      "create-second-parent-input"
                    ).innerHTML = "";
                  }
                  inputChangedHandler();
                }
              }}
            ></input>
          </p>
          <ul
            className="datalist-ul"
            id="create-datalist"
            onClick={(e) => {
              try {
                const text = $.trim(e.target.closest("li").textContent);
                if (text !== "No Results Found...")
                  $(activeParentInput).val(text);
                inputChangedHandler();
              } catch {}
            }}
          ></ul>
          <div className="two-button-container">
            <button
              type="button"
              id="cancel"
              className="btn btn-outline-primary"
              onClick={closePopups}
            >
              Cancel
            </button>
            <button
              type="button"
              id="save"
              className="btn btn-primary float-right"
              onClick={submit}
            >
              Save Changes
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
export default Create;
