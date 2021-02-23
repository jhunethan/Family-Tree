import React from "react";
import "dateformat";

var dateFormat = require("dateformat");

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
    if (data[i].pid === Number(id) && data[i].isPartner !== 1) {
      arr.push(data[i]);
    }
  }
  if (arr.length > 0) return arr;
};

export function NodeCardDetails(props) {
  switch (props.method) {
    case "birthdate":
      try {
        if (props.node.extradetails.birthplace && props.node.birthdate) {
          return (
            <section>
              <h2>Born</h2>
              <p>
                <div>{dateFormat(props.node.birthdate, "dS mmmm yyyy")}</div>
                <div>{props.node.extradetails.birthplace}</div>
              </p>
            </section>
          );
        }
        if (props.node.extradetails.birthplace) {
          return (
            <section>
              <h2>Born</h2>
              <p>in {props.node.extradetails.birthplace}</p>
            </section>
          );
        }
      } catch {}
      if (props.node.birthdate)
        return (
          <section>
            <h2>Born</h2>
            <p>{props.node.birthdate}</p>
          </section>
        );
      return null;
    case "deathdate":
      try {
        if (props.node.deathdate) {
          return (
            <section>
              <h2>Died</h2>
              <p>{dateFormat(props.node.deathdate, "dS mmmm yyyy")}</p>
            </section>
          );
        }
      } catch {}
      return null;
    case "generation":
      if (props.node.generation) {
        return (
          <section>
            <h2>Generation</h2>
            <p>{props.node.generation}</p>
          </section>
        );
      }
      return null;

    case "location":
      try {
        if (props.node.extradetails.location) {
          return (
            <section>
              <h2>Current location</h2>
              <p>{props.node.extradetails.location}</p>
            </section>
          );
        }
      } catch {}
      return null;
    case "profession":
      try {
        if (props.node.extradetails.profession) {
          return (
            <section>
              <h2>Profession</h2>
              <p>{props.node.extradetails.profession}</p>
            </section>
          );
        }
      } catch {}
      return null;
    case "extranames":
      try {
        let extranames = props.node.extradetails.extranames;

        if (extranames) {
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
        if (props.node.extradetails.description) {
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
      return null;
  }
}

export function ImmediateFamily(props) {
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
        if (parent.partnerinfo.name) {
          return (
            <div className="card-parents card-related">
              <h2>Known Parents</h2>
              <p>{props.node.parent}</p>
              <p>{partner}</p>
            </div>
          );
        }
      } catch {
        if (props.node.parent) {
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
