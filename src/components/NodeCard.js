import React, { useState } from "react";
import * as $ from "jquery";
import Axios from "axios";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

const getNode = (name, data) => {
  let tempname;
  for (let i = 0; i < data.length; i++) {
    tempname = data[i].generation + " " + data[i].name;
    if (name === tempname || name === data[i].name) {
      return data[i];
    }
  }
};

const getChildren = (id, data) => {
  let arr = [];
  if (Number(id) === 0) return arr;
  for (let i = 0; i < data.length; i++) {
    if (data[i].pid === Number(id)) {
      if (data[i].isPartner !== 1) arr.push(data[i]);
    }
  }
  if (arr.length > 0) return arr;
};

function NodeCardDetails(props) {
  switch (props.method) {
    case "birthdate":
      try {
        if (
          props.node.extradetails.birthplace !== "" &&
          props.node.birthdate !== ""
        ) {
          return (
            <section>
              <h2>Born</h2>
              <p>
                {props.node.birthdate} in {props.node.extradetails.birthplace}
              </p>
            </section>
          );
        } else if (props.node.extradetails.birthplace !== "") {
          return (
            <section>
              <h2>Born</h2>
              <p>in {props.node.extradetails.birthplace}</p>
            </section>
          );
        }
      } catch {}
      if (props.node.birthdate !== "") {
        return (
          <section>
            <h2>Born</h2>
            <p>{props.node.birthdate}</p>
          </section>
        );
      }
      return null;
    case "generation":
      if (props.node.generation !== "") {
        return (
          <section>
            <h2>Generation</h2>
            <p>{props.node.generation}</p>
          </section>
        );
      } else {
        return null;
      }
    case "location":
      try {
        if (props.node.extradetails.location !== "") {
          return (
            <section>
              <h2>Current location</h2>
              <p>{props.node.extradetails.location}</p>
            </section>
          );
        } else return null;
      } catch {
        return null;
      }
    case "extranames":
      try {
        let extranames = props.node.extradetails.extranames;

        if (extranames !== "") {
          return (
            <section>
              <h2>Additional Names</h2>
              <p>{extranames}</p>
            </section>
          );
        } else return null;
      } catch {
        return null;
      }
    case "fblink":
      try {
        if (
          props.node.extradetails.fblink.includes("https://www.facebook.com")
        ) {
          return (
            <section>
              <a className="fblink" href={props.node.extradetails.fblink}>
                Facebook Link
              </a>
            </section>
          );
        } else {
          return null;
        }
      } catch {
        return null;
      }
    case "description":
      try {
        if (props.node.extradetails.description !== "") {
          let output = props.node.extradetails.description.split("\n\n");
          let count = 0;
          return (
            <section>
              <h2>Description</h2>
              <div>
                {output.map((x) => {
                  count += 1;
                  return <p key={count}>{x}</p>;
                })}
              </div>
            </section>
          );
        } else return null;
      } catch {
        return null;
      }
    default:
      break;
  }
}

function ImmediateFamily(props) {
  switch (props.method) {
    case "parents":
      try {
        let parent = getNode(props.node.parent, props.treeData);
        let partner;
        try {
          partner = `${parent.partnerinfo.name} (${parent.partnerinfo.extradetails.extranames})`;
        } catch {
          partner = parent.partnerinfo.name;
        }
        if (parent.partnerinfo.name !== "") {
          return (
            <div className="card-parents card-related">
              <h2>Known Parents</h2>
              <p>{props.node.parent}</p>
              <p>{partner}</p>
            </div>
          );
        }
      } catch {
        if (props.node.parent !== undefined && props.node.parent !== "") {
          return (
            <div className="card-parents card-related">
              <h2>Known Parents</h2>
              <p>{props.node.parent}</p>
            </div>
          );
        } else {
          return null;
        }
      }
      return null;
    case "siblings":
      try {
        let parent = getNode(props.node.parent, props.treeData);
        let siblings = getChildren(parent.id, props.treeData);
        if (siblings.length > 1) {
          return (
            <div className="card-siblings card-related">
              <h2>Known Siblings</h2>
              {siblings.map((x) => {
                if (x.name !== props.node.name) {
                  return (
                    <p key={x.id}>
                      {x.generation} {x.name}
                    </p>
                  );
                } else return <p key={x.id}></p>;
              })}
            </div>
          );
        } else return null;
      } catch {
        return null;
      }
    case "children":
      try {
        let node, id;
        node = getNode(props.node.name, props.treeData);
        node.isPartner ? (id = node.pid) : (id = node.id);
        let children = getChildren(id, props.treeData);
        if (children.length > 0) {
          return (
            <div className="card-children card-related">
              <h2>Known Children</h2>
              {children.map((x) => {
                return (
                  <p key={x.id}>
                    {x.generation} {x.name}
                  </p>
                );
              })}
            </div>
          );
        }
      } catch {
        return null;
      }
      return null;
    default:
      return null;
  }
}

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);
  const [image, setImage] = useState(undefined);

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "100%");
      $("#card-container").css("width", "100%");
      $("#card-container").css("margin-left", "0px");
      $("#card-expand").html("><");
      setcardexpanded(true);
    } else {
      $("div.card-main").css("width", 350);
      $("#card-container").css("width", 350);
      $("#card-container").css("margin-left", "10px");
      $("#card-expand").html("<>");
      setcardexpanded(false);
    }
  };

  const inputFileHandler = (event) => {
    setImage(event.target.files[0]);
  };

  const submit = () => {
    var fd = new FormData();
    fd.append("file", image);
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    Axios.post("http://localhost:5000/api/upload", fd, config);
  };

  return (
    <div id="card-container">
      <div className="card-nav">
        <button
          id="card-close"
          onClick={() => {
            $("#card-container").css("display", "none");
          }}
        >
          X
        </button>
        <button id="card-expand" onClick={transform}>
          {"<>"}
        </button>
        <button id="card-edit" onClick={props.edit}>
          Edit
        </button>
      </div>
      <div className="card-main">
        <section className="top-card">
          <img src={placeholder} alt="user" />
        </section>
        <input type="file" id="uploadfile" onChange={inputFileHandler} />
        <input type="submit" onClick={() => submit()} />
        <section className="middle-card">
          <h1 className="card-subtitle">
            {props.node.generation} {props.node.name}
          </h1>
          <div className="card-content">
            <div className="card-details">
              <NodeCardDetails node={props.node} method="birthdate" />
              <NodeCardDetails node={props.node} method="generation" />
              <NodeCardDetails node={props.node} method="location" />
              <NodeCardDetails node={props.node} method="extranames" />
              <NodeCardDetails node={props.node} method="fblink" />
            </div>
            <div className="card-description">
              <NodeCardDetails node={props.node} method="description" />
            </div>
          </div>
        </section>
        <footer>
          <h1 className="card-subtitle">Immediate Family Members</h1>
          <section className="related-container">
            <ImmediateFamily
              node={props.node}
              treeData={props.treeData}
              method="children"
            />
            <ImmediateFamily
              node={props.node}
              treeData={props.treeData}
              method="parents"
            />
            <ImmediateFamily
              node={props.node}
              treeData={props.treeData}
              method="siblings"
            />
          </section>
        </footer>
      </div>
    </div>
  );
}
