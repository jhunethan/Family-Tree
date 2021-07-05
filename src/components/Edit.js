import React, { useState, useEffect } from "react";
import "../css/Edit.css";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

function ListDisplay(props) {
  const { node, method, remove } = props;
  try {
    var names = node.extradetails[props.method];
    return (
      <div className="flex-cards-display" id={`flex-cards-display-${method}`}>
        {names.split(",").map((x, index) => {
          if (x)
            return (
              <p
                className="flex-cards-edit"
                onClick={(event) => {
                  remove(event.target.textContent);
                }}
                key={`${method}` + index}
              >
                {x}
              </p>
            );
          return null;
        })}
      </div>
    );
  } catch {}
  return <div id={`flex-cards-display-${props.method}`}></div>;
}

function getParentByName(parentName, data) {
  if (!data) return;
  for (const person of data) {
    const fullname = `${person.generation} ${person.name}`;
    if (parentName === fullname || parentName === person.name) {
      if (person.id) return person;
    }
  }
}

function ParentDisplay(props) {
  const { currentPerson, data } = props;
  const parents = [];
  let parentName;
  if (currentPerson) {
    parentName = currentPerson["parent"];
    const firstParent = getParentByName(parentName, data);
    parents[0] = firstParent;
    if (currentPerson["secondParent"]) {
      parentName = currentPerson["secondParent"];
      const secondParent = getParentByName(parentName, data);
      parents[1] = secondParent;
    }
  }

  if (parents[0] && parents.length) {
    return (
      <section className="editmenu-parents-display">
        {parents.map((person, index) => {
          return (
            <div
              key={`${parents} ${index}`}
              className="editmenu-parents-display-child"
            >
              <p>Parent {index + 1}</p>
              <h2>{person.generation}</h2>
              <h2>{person.name}</h2>
              <h2>{person.birthdate}</h2>
            </div>
          );
        })}
      </section>
    );
  }

  return null;
}

function EditDropdownInput(props) {
  const {
    title,
    inputType,
    id,
    placeholder,
    inputChangedHandler,
    data,
    setData,
    field,
    keyPress,
    list,
  } = props;
  let currValue = "";

  try {
    if (data.extradetails[field]) currValue = data.extradetails[field];
  } catch (error) {}
  if (!currValue) currValue = data[field];

  const [input, setInput] = useState("initialstate");

  return (
    <section className="dropdownmenu">
      <div
        className="dropdownmenu-info"
        onClick={() => {
          const el = document.getElementById(`dropdownmenu-container-${id}`);
          if (el.style.display === "flex") {
            el.style.display = "none";
          } else el.style.display = "flex";
        }}
      >
        <label className="dropdownmenu-title">{title}</label>
        <h2 className="dropdownmenu-icon">⌄</h2>
      </div>
      <div
        id={`dropdownmenu-container-${id}`}
        className="dropdownmenu-input-container"
      >
        <input
          type={inputType}
          id={id}
          className="extra-details-input"
          onChange={(event) => {
            inputChangedHandler();
            setInput(event.target.value);
          }}
          onClick={(event) => {
            inputChangedHandler();
            setInput(event.target.value);
          }}
          placeholder={placeholder}
          onKeyDown={keyPress}
        />
        {currValue && input && (
          <h2
            className="dropdownmenu-cancel"
            onClick={() => {
              document.getElementById(id).value = "";
              inputChangedHandler();
              setInput(null);
            }}
          >
            <span aria-hidden="true">&times;</span>
          </h2>
        )}
        {list && (
          <ListDisplay
            node={data}
            method={list}
            remove={(deleted) => {
              let node = data;
              try {
                node.extradetails[list] = node.extradetails[list]
                  .split(",")
                  .filter((x) => x !== deleted)
                  .join(",");
                setData((currObj) => {
                  return { ...currObj, ...node };
                });
              } catch {}
              inputChangedHandler();
            }}
          />
        )}
      </div>
    </section>
  );
}

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

  useEffect(() => {
    setNodeInput(props.nodedata);
  }, [props.nodedata]);

  const filterChildren = (id, arr) => {
    let children = arr.filter((x) => {
      return x.pid === Number(id);
    });
    arr = arr.filter((x) => {
      return x.pid !== Number(id);
    });
    arr = arr.filter((x) => x.id !== id);
    try {
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          arr = filterChildren(children[i].id, arr);
        }
      }
    } catch {}
    return arr;
  };

  const getValidBirthdate = () => {
    const day = $("#birthdate-dd").val();
    const month = $("#birthdate-mm").val();
    const year = $("#birthdate-yyyy").val();

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

  var inputChangedHandler = (obj) => {
    let { isPartner = false, pid, deathdate = null } = props.nodedata;
    const currentObject = obj.id ? obj : nodeInput;
    const extraopStack = [
      "birthplace",
      "location",
      "fblink",
      "profession",
      "marriagedate",
    ];

    CheckInput(obj);
    checkExtraChanges();

    //if parent field, populate parent datalist autofill
    //filter by input
    let datalistcount = 0,
      filteredDatalist = [],
      dataset = filterChildren(props.nodedata.id, props.data);

    $("#parentSearchDataList").html("");

    if ($.trim($("#parentInput").val())) {
      for (const x of dataset) {
        if (x.name && datalistcount < 5) {
          filteredDatalist.push(
            x.generation ? `${x.generation} ${x.name}` : x.name
          );
        }
      }

      let parsed = $.trim($("#parentInput").val().toLowerCase()).split(" ");
      filteredDatalist = filteredDatalist.filter((x) => {
        for (const word of parsed) {
          if (!x.toLowerCase().includes(word)) return false;
        }
        return true;
      });
      //checks if input !== first entry in searched datalist
      if ($.trim($("#parentInput").val()) !== filteredDatalist[0]) {
        for (const n of filteredDatalist) {
          //adds up to five matching names from data to datalist
          if (datalistcount < 5) {
            $("#parentSearchDataList").append(`<li>${n}</li>`);
            datalistcount += 1;
          }
        }
        if (datalistcount === 0)
          $("#parentSearchDataList").append(
            `<li style="pointer-events:none;">No valid results</li>`
          );
      }
    }

    deathdate = $("#deathdate-input").val();

    let tempnode = {};

    tempnode.maidenname =
      isPartner === 1 ? $.trim($("#maidenname-input").val()) : null;

    for (const x of extraopStack) {
      tempnode[x] = $.trim($(`#${x}-input`).val());
    }
    try {
      tempnode.extranames = currentObject.extradetails.extranames;
      tempnode.languages = currentObject.extradetails.languages;
    } catch {}
    tempnode.description = $.trim($("textarea.description-input").val());

    if (isPartner === 0) {
      tempnode.marriagedate = null;
      tempnode.maidenname = null;
    }

    if (!currentObject.pid) pid = 0;

    if (pid === 0 || !pid) isPartner = 0;

    const birthdate = getValidBirthdate();
    const newObject = {
      id: props.nodedata.id,
      generation: $("#generation-input").val(),
      name: $("#name-input").val(),
      birthdate: birthdate,
      pid: pid,
      deathdate: deathdate,
      extradetails: tempnode,
    };

    setNodeInput({
      ...currentObject,
      ...newObject,
    });
  };

  function CheckInput(obj) {
    const currentObject = obj.id ? obj : nodeInput;
    
    let changesStack = [],
      opStack = ["generation", "name"];
    let data = props.nodedata;

    setChanges("");
    setChanged(false);

    for (const x of opStack) {
      if (data[x] !== $(`#${x}-input`).val()) {
        changesStack.push(x);
        setChanged(true);
      }
    }

    const birthdate = getValidBirthdate();

    if (data["birthdate"] !== birthdate) {
      changesStack.push("birthdate");
      setChanged(true);
    }

    //deal with empty string compared to null type
    let deathdate = !data.deathdate ? "" : data.deathdate;

    if ($("#deathdate-input").val() !== deathdate) {
      setChanged(true);
      changesStack.push("deathdate");
    }
    if (currentObject.parent !== props.nodedata.parent) {
      setChanged(true);
      changesStack.push("parent");
    }
    if (currentObject.secondParent !== props.nodedata.secondParent) {
      setChanged(true);
      changesStack.push("secondParent");
    }
    setChanges(changesStack.join(","));
  }

  function checkPartner() {
    const element = $("#parentInput");

    for (let i = 0; i < props.data.length; i++) {
      let namecheck = props.data[i].generation + " " + props.data[i].name;
      if (element.val() === namecheck || element.val() === props.data[i].name)
        return true;
    }
    if ($.trim(element.val()) === "") return true;
    element.css("border-bottom", "2px solid red");
    element.val("");
    element.attr("placeholder", "invalid parent: click from list");
    toast.error("Partner not found: please re-enter");
    return false;
  }

  function checkParent() {
    const element = $("#parentInput");

    if (props.nodedata.partner) return checkPartner();

    for (const x of props.datalist) {
      let namecheck = x.generation + " " + x.name;
      if (element.val() === namecheck) return true;
      if (x.name === element.val()) return true;
    }
    if ($.trim(element.val()) === "") return true;
    element.css("border-bottom", "2px solid red");
    element.val("");
    element.attr("placeholder", "invalid parent: click from list");
    toast.error("Parent not found: please re-enter");
    return false;
  }

  function saveEdit() {
    if (changed && checkParent()) {
      //save
      Axios.patch(process.env.REACT_APP_API + "api/familymembers", {
        input: nodeInput,
        name: props.nodedata.name,
        author: cookies.author,
        changes: changes,
      });
      closeEditMenu();
    }
    if (extrachanged) {
      Axios.patch(process.env.REACT_APP_API + "api/extradetails", {
        id: props.nodedata.id,
        name: props.nodedata.name,
        input: nodeInput,
        author: cookies.author,
        changes: extrachanges,
      });
      closeEditMenu();
    }

    setChanged(false);
    setExtrachanged(false);
  }

  const closeEditMenu = (param) => {
    for (const x of [
      "#editForm",
      "#Modal",
      "div.edit-container",
      "#card-container",
    ]) {
      $(`${x}`).css("display", "none");
    }
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
      Axios.delete(
        `http://localhost:5000/api/familymembers?id=${props.nodedata.id}&name=${props.nodedata.name}&author=${cookies.author}`
      );

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
      opStack = ["birthplace", "location", "fblink", "profession"];
    let data = props.nodedata.extradetails;
    setExtrachanged(false);

    try {
      for (const x of opStack) {
        if (data[x] !== $(`#${x}-input`).val()) {
          arr.push(x);
          setExtrachanged(true);
        }
      }

      if (nodeInput.extradetails.extranames !== data.extranames) {
        setExtrachanged(true);
        arr.push("additional names");
      }

      if (nodeInput.extradetails.languages !== data.languages) {
        setExtrachanged(true);
        arr.push("Spoken Languages");
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

      if ($("#languages-input").val().length > 0) {
        setExtrachanged(true);
        arr.push("languages");
      }

      if ($("textarea.description-input").val().length > 0) {
        arr.push("description");
        setExtrachanged(true);
      }
    }
    setExtrachanges(arr.join(","));
  };

  function addOption(method) {
    let val = $(`#${method}-input`).val();
    if ($.trim(val)) {
      let node = nodeInput,
        names = [];
      try {
        names = node.extradetails[method].split(",");
        if (!node.extradetails[method]) {
          names[0] = val;
        } else {
          names.push($.trim(val));
        }
        node.extradetails[method] = names.join(",");
      } catch {
        node.extradetails[method] = $.trim(val);
      }
      setNodeInput((currObj) => {
        return { ...currObj, ...node };
      });
      inputChangedHandler();
    }
    $(`#${method}-input`).val("");
  }

  function addParent(parentName) {
    let keys = {};

    //check if current person already has a parent
    if (nodeInput.parent && nodeInput.secondParent) {
      toast.error("You can only add up to two parents");
      return false;
    }

    //get parent info
    const parent = getParentByName(parentName, props.data);

    //decide appropriate key to edit
    if (nodeInput.parent) {
      keys.parent = "secondParent";
      keys.pid = "secondPid";
    } else {
      keys.parent = "parent";
      keys.pid = "pid";
    }

    const tempObj = {
      [keys.pid]: parent.id,
      [keys.parent]: parentName,
    };
    //add person as parent
    setNodeInput((currObj) => {
      inputChangedHandler({ ...currObj, ...tempObj });
      return { ...currObj, ...tempObj };
    });
  }

  return (
    <div id="Edit">
      <div id="editForm" className="form">
        <h2 className="edit-header">Edit Details</h2>
        <button type="submit" id="deleteNode" onClick={deleteNode}>
          Delete
        </button>
        <p type="Generation Name">
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
        <p type="Name">
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
                document.getElementById("birthdate-dd").focus();
              }
            }}
          />
        </p>
        <label htmlFor="edit-birthdate">Date of Birth</label>

        <div className="birthdate-input-container" name="edit-birthdate">
          <input
            className="birthdate-input"
            type="number"
            name="birthdate-dd"
            id="birthdate-dd"
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
                document.getElementById("birthdate-mm").focus();
              }
            }}
          />
          <input
            className="birthdate-input"
            type="number"
            name="birthdate-mm"
            min="1"
            max="12"
            id="birthdate-mm"
            placeholder="mm"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter" || event.target.value.length === 2) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("birthdate-yyyy").focus();
              }
            }}
          />
          <input
            className="birthdate-input"
            type="number"
            name="birthdate-yyyy"
            id="birthdate-yyyy"
            placeholder="yyyy"
            min="1"
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              // Number 13 is the "Enter" key on the keyboard
              if (event.key === "Enter" || event.target.value.length === 4) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Focus on next element
                document.getElementById("parentInput").focus();
              }
            }}
          />
        </div>

        <p type="Add a parent (up to 2)">
          <input
            autoComplete="off"
            id="parentInput"
            className="extra-details-input"
            placeholder="Name of Parent"
            onClick={inputChangedHandler}
            onChange={inputChangedHandler}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
                try {
                  const parentSuggestion = $.trim(
                    $("#parentSearchDataList").children()[0].textContent
                  );
                  if (
                    parentSuggestion &&
                    parentSuggestion !== "No valid results"
                  ) {
                    $("#parentInput").val("");
                    addParent(parentSuggestion, props.nodedata);
                  }
                  inputChangedHandler();
                } catch {}
                // Focus on next element
                document.getElementById("birthplace-input").focus();
              }
            }}
          />
        </p>
        <ul
          className="datalist-ul"
          id="parentSearchDataList"
          onClick={(e) => {
            try {
              $("#parentInput").val($.trim(e.target.closest("li").textContent));
              inputChangedHandler();
            } catch {}
          }}
        ></ul>

        <ParentDisplay data={props.data} currentPerson={nodeInput} />

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="date"
          title="Date of Death"
          field="deathdate"
          id="deathdate-input"
          data={props.nodedata}
        />

        {/* <label
          htmlFor="maidenname-input"
          className="extra-details-label spouse-info"
        >
          Maiden name
        </label>
        <input
          autoComplete="off"
          type="text"
          name="maidenname-input"
          id="maidenname-input"
          className="extra-details-input spouse-info"
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
        <label
          htmlFor="marriagedate-input"
          className="extra-details-label spouse-info"
        >
          Marriage Date
        </label>
        <input
          autoComplete="off"
          type="date"
          name="marriagedate-input"
          id="marriagedate-input"
          className="extra-details-input spouse-info"
          onChange={inputChangedHandler}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("birthplace-input").focus();
            }
          }}
        /> */}

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Place of Birth"
          id="birthplace-input"
          data={props.nodedata}
          field="birthplace"
        />

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Currently Living in..."
          id="location-input"
          data={props.nodedata}
          field="location"
        />

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Additional Names"
          id="extranames-input"
          data={props.nodedata}
          field="extranames"
          keyPress={function (event) {
            if (event.key === "Enter") {
              addOption("extranames");
              inputChangedHandler();
            }
          }}
          list="extranames"
          setData={setNodeInput}
        />

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Languages Spoken"
          id="languages-input"
          data={props.nodedata}
          field="languages"
          keyPress={function (event) {
            if (event.key === "Enter") {
              addOption("languages");
              inputChangedHandler();
            }
          }}
          list="languages"
          setData={setNodeInput}
        />

        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Facebook URL Link"
          id="fblink-input"
          data={props.nodedata}
          field="fblink"
        />
        <EditDropdownInput
          inputChangedHandler={inputChangedHandler}
          inputType="text"
          title="Profession"
          id="profession-input"
          data={props.nodedata}
          field="profession"
        />
        <label htmlFor="description-input" className="extra-details-label">
          Description ( {descriptionlimit}/250 words )
        </label>
        <textarea
          type="text"
          name="description-input"
          className="extra-details-input description-input"
          placeholder="Tell us about this person..."
          onChange={descriptionHandler}
        />

        <div className="edit-button-container">
          <button
            type="button"
            id="save"
            className="edit-button"
            onClick={saveEdit}
          >
            Save Changes
          </button>
          <button
            type="button"
            id="cancel"
            className="edit-button"
            onClick={() => closeEditMenu("unsave")}
          >
            Cancel
          </button>
        </div>
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
          <button
            type="button"
            className="edit-button"
            onClick={cancelDeleteConfirm}
          >
            Cancel
          </button>
          <button
            type="button"
            className="edit-button"
            onClick={confirmDeletion}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
