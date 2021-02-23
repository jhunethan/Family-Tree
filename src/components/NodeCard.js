import React, { useState } from "react";
import * as $ from "jquery";
import Axios from "axios";
import { useCookies } from "react-cookie";
import { Image } from "cloudinary-react";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";
import editIcon from "../css/edit-button.png";
import { NodeCardDetails, ImmediateFamily } from "./NodeCardContent";

function MemberPhotos(props) {
  const [cookies] = useCookies(["author"]);

  const imageDelete = (e) => {
    Axios.post("http://localhost:5000/api/delete/image", {
      id: props.node.id,
      author: cookies.author,
      public_id: e.target.parentNode.previousElementSibling.classList[1],
    }).then(() => {
      $("#card-container").css("display", "none");
      props.update();
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
                  <div className="image-expand image-menu">EXPAND</div>
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

function AddPhoto(props) {
  const [fileName, setFileName] = useState("");
  try {
    if (props.node.extradetails.photo_id.split(",").length < 3) {
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
              props.imageChangeHandler(event);
              setFileName(event.target.files[0].name);
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
        </div>
      );
    } else {
      return null;
    }
  } catch (error) {
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
          onChange={(event) => props.imageChangeHandler(event)}
        />
        <input
          type="submit"
          className="file-submit"
          onClick={() => {
            props.uploadImage();
            props.update();
          }}
          value="Submit Photo"
        />
      </div>
    );
  }
}

export default function NodeCard(props) {
  const [imageToBeSent, setImageToBeSent] = useState(undefined);
  const [cookies] = useCookies(["author"]);
  var cardexpanded = false;
  var uploadProgress;

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "100%");
      $("#card-container").css("width", "100%").css("margin-left", "0px");
      $("#card-expand").html("><");
      cardexpanded = true;
    } else {
      $("div.card-main").css("width", 350);
      $("#card-container").css("width", 350).css("margin-left", "10px");
      $("#card-expand").html("<>");
      cardexpanded = false;
    }
  };

  const uploadImage = () => {
    const formData = new FormData();
    formData.append("file", imageToBeSent);
    formData.append("upload_preset", "oms6f6zi");

    Axios.post(
      "https://api.cloudinary.com/v1_1/dqwu1p8fp/image/upload",
      formData,
      {
        onUploadProgress: (progressEvent) => {
          uploadProgress = progressEvent.lengthComputable
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          $("div.progress-bar").css("width", `${uploadProgress}%`);
        },
      }
    ).then((Response) => {
      console.log(Response);
      //save it to extradetails db as filename: `${Response.data.public_id}.${Response.data.format}`
      let photo_id_string;
      try {
        if (props.node.extradetails.photo_id) {
          photo_id_string = `${props.node.extradetails.photo_id},${Response.data.public_id}`;
        } else {
          photo_id_string = Response.data.public_id;
        }
      } catch {
        photo_id_string = Response.data.public_id;
      }
      $("#card-container").css("display", "none");
      Axios.put("http://localhost:5000/api/updateextra", {
        id: Number(props.node.id),
        photo_id: photo_id_string,
        author: cookies.author,
      }).then(() => {
        setTimeout(() => {
          props.update();
        }, 250);
      });
    });
  };

  const imageChangeHandler = (event) => {
    if (
      event.target.files[0].size <= 5 * 1024 * 1024 &&
      event.target.files[0].type.includes("image/")
    ) {
      return setImageToBeSent(event.target.files[0]);
    }
    //else err
    console.log("file invalid or exceeds 5MB");
    event.target.files = null;
  };

  $("div.progress-bar").css("width", 0);

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
          <img src={editIcon} className="card-edit-icon" alt="edit"></img>
        </button>
      </div>
      <div className="card-main">
        <section className="top-card">
          <MemberPhotos node={props.node} update={props.update} />
        </section>
        <AddPhoto
          imageChangeHandler={imageChangeHandler}
          uploadImage={uploadImage}
          update={props.update}
          node={props.node}
        />
        <div className="progress-bar"></div>
        <section className="middle-card">
          <h1 className="card-subtitle">
            {props.node.generation} {props.node.name}
          </h1>
          <div className="card-content">
            <div className="card-details">
              <NodeCardDetails node={props.node} method="birthdate" />
              <NodeCardDetails node={props.node} method="deathdate" />
              <NodeCardDetails node={props.node} method="generation" />
              <NodeCardDetails node={props.node} method="profession" />
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
