import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";

function Create(props) {
  const [pid, setPid] = useState("");
  const [generation, setGeneration] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const inputChangedHandler = () => {
    props.update();
  };

  const submit = () => {
    Axios.post("http://localhost:5000/api/insert", {
      pid: pid,
      generation: generation,
      name: name,
      birthdate: birthdate,
    }).then(() => {
      alert("successful insert");
      props.update();
      try {
        document.getElementsByClassName("Create")[0].style.display = "none";
        document.getElementById("Modal").style.display = "none";
      } catch {}
    });
  };

  return (
    <div className="Create">
      <h2>Add New</h2>

      <p type="Generation">
        <input
          id="genInputC"
          onChange={(e) => {
            setGeneration(e.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              document.getElementById("nameinputC").focus();
            }
          }}
        />
      </p>
      <p type="Name:">
        <input
          id="nameinputC"
          onChange={(e) => {
            setName(e.target.value);
          }}
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
          id="birthdateInputC"
          onChange={(e) => {
            setBirthdate(e.target.value);
          }}
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
          id="parentInputC"
          placeholder="Name of Parent/ Partner"
          list="parentSearchDataList"
          onChange={(e) => {
            setPid(e.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              submit();
            }
          }}
        ></input>
        <datalist id="parentSearchDataList"></datalist>
      </p>

      <div className="radio-toggles">
        <input
          onClick={props.switchRadioC}
          onChange={inputChangedHandler}
          type="radio"
          id="option-1"
          name="radio-optionsC"
          checked={props.radiocheckedC}
          value="child"
        />
        <label htmlFor="option-1">Child</label>
        <input
          onClick={props.switchRadioC}
          onChange={inputChangedHandler}
          type="radio"
          id="option-2"
          name="radio-optionsC"
          checked={!props.radiocheckedC}
          value="partner"
        />
        <label htmlFor="option-2">Partner</label>
        <div className="slide-itemC"></div>
      </div>
      <button type="button" id="save" onClick={submit}>
        Save Changes
      </button>
      <button
        type="button"
        id="cancel"
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
