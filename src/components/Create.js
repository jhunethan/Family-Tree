import React, { useState } from "react";
import "../css/Create.css";
import Axios from "axios";

function Create(props) {
  const [pid, setPid] = useState("");
  const [generation, setGeneration] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const submit = () => {
    Axios.post("https://lay-family-tree.herokuapp.com//api/insert", {
      pid: pid,
      generation: generation,
      name: name,
      birthdate: birthdate,
    }).then(() => {
      alert("successful insert");
      props.update();
      try {
        document.getElementsByClassName("Create")[0].style.display = "none";
        document.getElementById("exitCatch").style.display = "none";
      } catch {}
    });
  };

  return (
    <div className="Create">
      <button
        className="createexit"
        onClick={() => {
          try {
            document.getElementsByClassName("Create")[0].style.display = "none";
            document.getElementById("exitCatch").style.display = "none";
          } catch {}
        }}
      >
        X
      </button>
      <h1>Create New Entry</h1>

      <form className="form">
        <label>Generation</label>
        <input
          autoComplete="off"
          type="text"
          name="generationInput"
          onChange={(e) => {
            setGeneration(e.target.value);
          }}
        />
        <label>Name</label>
        <input
          autoComplete="off"
          type="text"
          name="nameInput"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <label>Birthdate</label>
        <input
          type="date"
          name="birthdateInput"
          onChange={(e) => {
            setBirthdate(e.target.value);
          }}
        />
        <label>Parent</label>
        <input
          type="text"
          name="pidInput"
          onChange={(e) => {
            setPid(e.target.value);
          }}
        />
        <button type="button" onClick={submit}>
          Submit
        </button>
      </form>
    </div>
  );
}
export default Create;
