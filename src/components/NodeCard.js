import React, { useState } from "react";
import * as $ from "jquery";
import Axios from "axios";
import { Image } from "cloudinary-react";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";
import { NodeCardDetails, ImmediateFamily } from "./NodeCardContent";
import { useCookies } from "react-cookie";

function MemberPhotos(props) {
  try {
    if (props.node.extradetails.photo_id) {
      return (
        <Image
          cloudName="dqwu1p8fp"
          public_id={props.node.extradetails.photo_id}
        />
      );
    }
  } catch {}
  return <img src={placeholder} alt="placeholder" />;
}

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);
  const [imageToBeSent, setImageToBeSent] = useState(undefined);
  const [cookies] = useCookies(["author"]);

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "100%");
      $("#card-container").css("width", "100%").css("margin-left", "0px");
      $("#card-expand").html("><");
      setcardexpanded(true);
    } else {
      $("div.card-main").css("width", 350);
      $("#card-container").css("width", 350).css("margin-left", "10px");
      $("#card-expand").html("<>");
      setcardexpanded(false);
    }
  };

  const uploadImage = () => {
    const formData = new FormData();
    formData.append("file", imageToBeSent);
    formData.append("upload_preset", "oms6f6zi");

    Axios.post(
      "https://api.cloudinary.com/v1_1/dqwu1p8fp/image/upload",
      formData
    ).then((Response) => {
      console.log(Response);
      //save it to extradetails db as filename: `${Response.data.public_id}.${Response.data.format}`
      Axios.put("http://localhost:5000/api/updateextra", {
        id: Number(props.node.id),
        photo_id: Response.data.public_id,
        author: cookies.author,
      });
    });
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
          <MemberPhotos node={props.node} />
        </section>
        <input
          type="file"
          id="uploadfile"
          onChange={(event) => {
            setImageToBeSent(event.target.files[0]);
          }}
        />
        <input type="submit" onClick={() => uploadImage()} />
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
