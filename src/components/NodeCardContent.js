import React, { useState, useEffect } from "react";
import "dateformat";
import * as $ from "jquery";
import Axios from "axios";
import { useCookies } from "react-cookie";
import { Image } from "cloudinary-react";
import placeholder from "../css/person-placeholder.jpg";
// import Jcrop from "jcrop";
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
      if (props.node.birthdate)
        return (
          <section>
            <h2>Born</h2>
            <p>{dateFormat(props.node.birthdate, "dS mmmm yyyy")}</p>
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
    case "birthplace":
      try {
        if (props.node.extradetails.birthplace) {
          return (
            <section>
              <h2>Birthplace</h2>
              <p>{props.node.extradetails.birthplace}</p>
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
        if (props.node.extradetails.extranames) {
          return (
            <section>
              <h2>Other names</h2>
              <p>{props.node.extradetails.extranames}</p>
            </section>
          );
        }
      } catch {}
      return null;
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
        }
      } catch {}
      return null;
    case "description":
      try {
        if (props.node.extradetails.description) {
          let output = props.node.extradetails.description.split("\n\n");
          let count = 0;
          return (
            <section>
              <h2>Greatest Achievement</h2>
              <div>
                {output.map((x) => {
                  count += 1;
                  return <p key={count + "desc"}>{x}</p>;
                })}
              </div>
            </section>
          );
        }
      } catch {}
      return null;
    default:
      return null;
  }
}

export function ImmediateFamily(props) {
  switch (props.method) {
    case "parents":
      try {
        let parent = getNode(props.node.parent, props.treeData);
        let partner = parent.partnerinfo.name;

        if (parent.partnerinfo.name) {
          return (
            <div className="card-parents card-related">
              <h2>Parents</h2>
              <p
                onClick={() =>
                  props.show(getNode(props.node.parent, props.treeData))
                }
              >
                {props.node.parent}
              </p>
              <p
                onClick={() =>
                  props.show(
                    getNode(props.node.parent, props.treeData).partnerinfo
                  )
                }
              >
                {partner}
              </p>
            </div>
          );
        }
      } catch {
        if (props.node.parent) {
          return (
            <div className="card-parents card-related">
              <h2>Parents</h2>
              <p
                onClick={() =>
                  props.show(getNode(props.node.parent, props.treeData))
                }
              >
                {props.node.parent}
              </p>
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
              <h2>Siblings</h2>
              {siblings.map((x) => {
                if (x.name !== props.node.name) {
                  return (
                    <p
                      key={`siblings ${x.id}`}
                      onClick={() =>
                        props.show(getNode(x.name, props.treeData))
                      }
                    >
                      {x.generation} {x.name}
                    </p>
                  );
                } else return null;
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
              <h2>Children</h2>
              {children.map((x, i) => {
                return (
                  <p
                    key={`child ${x.id}${i}`}
                    onClick={() => props.show(getNode(x.name, props.treeData))}
                  >
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

export function MemberPhotos(props) {
  const [cookies] = useCookies(["author"]);

  const imageEdit = (e) => {
    // Jcrop.attach(e.target.parentNode.previousElementSibling);
    console.log(e.target.parentNode.previousElementSibling);
  };

  const imageDelete = (e) => {
    Axios.post("http://localhost:5000/api/delete/image", {
      id: props.node.id,
      name: props.node.name,
      author: cookies.author,
      public_id: e.target.parentNode.previousElementSibling.classList[1],
    }).then(() => {
      $("#card-container").css("display", "none");

      let photo_id_string = props.node.extradetails.photo_id
        .split(",")
        .filter(
          (x) => x !== e.target.parentNode.previousElementSibling.classList[1]
        )
        .join(",");
      let obj = props.node;
      obj.extradetails.photo_id = photo_id_string;
      props.update(obj);
    });
  };

  try {
    if (props.node.extradetails.photo_id) {
      let photos = props.node.extradetails.photo_id.split(",");
      return (
        <div className="image-container">
          {photos.map((x, index) => {
            return (
              <div
                className="image-single-container"
                key={`${index}-container`}
              >
                <Image
                  cloudName="dqwu1p8fp"
                  public_id={x}
                  className={"image " + x}
                />
                <div className="image-edit-menu">
                  <div
                    className="image-expand image-menu"
                    onClick={(e) => imageEdit(e)}
                  >
                    EDIT
                  </div>
                  <div
                    className="image-delete image-menu"
                    onClick={(e) => imageDelete(e)}
                  >
                    DELETE
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  } catch {}
  return (
    <div className="image-container">
      <img src={placeholder} className="image" alt="placeholder" />
    </div>
  );
}

export function AddPhoto(props) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    //reset photo fields
    $(".file-submit").css("display", "none");
    $(".file-input-button").css("display", "block");
  }, [props.node]);

  try {
    if (props.node.extradetails.photo_id.split(",").length >= 3) return null;
  } catch (error) {}
  return (
    <div className="file-input-container">
      <label className="file-input-button" htmlFor="file-input">
        Upload Photo
      </label>
      <input
        type="file"
        id="file-input"
        className="file-input"
        accept="image/*"
        onChange={(event) => {
          if (props.imageChangeHandler(event)) {
            setFileName(event.target.files[0].name);
            if (event.target.files[0].name) {
              $(".file-input-button").css("display", "none");
              $(".file-submit").css("display", "block");
            }
          }
        }}
      />
      {fileName}
      <input
        type="submit"
        className="file-submit"
        onClick={() => {
          props.uploadImage();
          setFileName("");
        }}
        value="Submit Photo"
      />
      <button
        className="file-submit"
        onClick={() => {
          document.getElementById("file-input").value = "";
          $(".file-input-button").css("display", "block");
          $(".file-submit").css("display", "none");
          setFileName("");
        }}
      >
        Cancel
      </button>
    </div>
  );
}
