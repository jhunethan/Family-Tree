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
      let photos = props.node.extradetails.photo_id.split(",");
      return (
        <div className="image-container">
          {photos.map((x, index) => {
            return <Image cloudName="dqwu1p8fp" public_id={x} key={index} />;
          })}
        </div>
      );
    }
  } catch {}
  return (
    <div className="image-container">
      <img src={placeholder} alt="placeholder" />;
    </div>
  );
}

export default function NodeCard(props) {
  const [imageToBeSent, setImageToBeSent] = useState(undefined);
  const [cookies] = useCookies(["author"]);
  var cardexpanded = false;

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
      formData
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
      Axios.put("http://localhost:5000/api/updateextra", {
        id: Number(props.node.id),
        photo_id: photo_id_string,
        author: cookies.author,
      });
    });
  };

  return (
    <div id="card-container">
      {" "}
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
          <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 50 50"
            className="svg-edit"
          >
            <g>
              <g>
                <circle cx="10" cy="30" r="10" fill="white" />
              </g>
            </g>
            <g>
              <g>
                <circle cx="40" cy="30" r="10" fill="white" />
              </g>
            </g>
            <g>
              <g>
                <circle cx="70" cy="30" r="10" fill="white" />
              </g>
            </g>
          </svg>
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
