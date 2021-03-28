import React, { useState } from "react";
import * as $ from "jquery";
import Axios from "axios";
import { useCookies } from "react-cookie";

import "../css/NodeCard.css";
import editIcon from "../css/edit-button.png";
import {
  NodeCardDetails,
  ImmediateFamily,
  AddPhoto,
  MemberPhotos,
} from "./NodeCardContent";
import EditPhoto from "./EditPhoto";

function EditPhotoCondition(props) {
  console.log(
    props.image ? `image src updated : ${props.image}` : "image src empty"
  );

  if (props.image)
    return (
      <EditPhoto
        closePopups={() => props.closePopups()}
        saveImage={() => props.saveImage()}
        setImage={(img)=>props.setImage(img)}
        node={props.node}
        update={(obj) => {
          props.update(obj);
        }}
        image={props.image}
      />
    );
  return null;
}

export default function NodeCard(props) {
  const [imageToBeSent, setImageToBeSent] = useState(undefined);
  const [cookies] = useCookies(["author"]);
  var cardexpanded = false;
  var uploadProgress;

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "100%").css("height", "95vh");
      $("#card-container")
        .css("width", "100%")
        .css("height", "95vh")
        .css("margin", "-75px 0 0 0px");
      $("#card-expand").html("><");
      cardexpanded = true;
      return;
    }
    $("div.card-main").css("width", 350).css("height", "auto");
    $("#card-container").css("width", 350).css("margin", "0 0 0 10px");
    $("#card-expand").html("<>");
    cardexpanded = false;
  };

  const uploadImage = () => {
    const formData = new FormData();
    formData.append("file", imageToBeSent);
    formData.append("upload_preset", "oms6f6zi");
    formData.append("id", props.node.id);

    // Axios.post("https://layfamily.herokuapp.com/api/upload", formData);

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

      let obj = props.node;
      if (!obj.extradetails) obj.extradetails = {};
      obj.extradetails.photo_id = photo_id_string;
      props.update(obj);

      Axios.put("https://layfamily.herokuapp.com/api/updateextra", {
        id: Number(props.node.id),
        name: props.node.name,
        photo_id: photo_id_string,
        author: cookies.author,
      });
    });
  };

  const imageChangeHandler = (event) => {
    if (
      event.target.files[0].size <= 5 * 1024 * 1024 &&
      event.target.files[0].type.includes("image/")
    ) {
      setImageToBeSent(event.target.files[0]);
      props.editPhoto(event.target.files[0]);
      return true;
    }
    //else err
    props.toast.error("file invalid or exceeds 5MB");
    event.target.files = null;
    return false;
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
          <MemberPhotos
            node={props.node}
            update={props.update}
            editPhoto={(src) => props.editPhoto(src)}
          />
        </section>
        <AddPhoto
          imageChangeHandler={imageChangeHandler}
          uploadImage={uploadImage}
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
              <NodeCardDetails node={props.node} method="birthplace" />
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
              show={(obj) => {
                props.show(obj);
              }}
              node={props.node}
              treeData={props.treeData}
              method="children"
            />
            <ImmediateFamily
              show={(obj) => {
                props.show(obj);
              }}
              node={props.node}
              treeData={props.treeData}
              method="parents"
            />
            <ImmediateFamily
              show={(obj) => {
                props.show(obj);
              }}
              node={props.node}
              treeData={props.treeData}
              method="siblings"
            />
          </section>
        </footer>
      </div>
      <EditPhotoCondition
        closePopups={() => props.closePopups()}
        saveImage={() => uploadImage()}
        setImage={(img) => setImageToBeSent(img)}
        image={props.image}
        update={(obj) => {
          props.update(obj);
        }}
      />
    </div>
  );
}
