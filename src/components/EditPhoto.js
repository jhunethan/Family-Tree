// import React, { useState } from "react";
// import "../css/EditPhoto.css";
// import "tui-image-editor/dist/tui-image-editor.css";
// import ImageEditor from "@toast-ui/react-image-editor";
// import * as $ from "jquery";
// import Axios from "axios";
// import { useCookies } from "react-cookie";

// const icona = require("tui-image-editor/dist/svg/icon-a.svg");
// const iconb = require("tui-image-editor/dist/svg/icon-b.svg");
// const iconc = require("tui-image-editor/dist/svg/icon-c.svg");
// const icond = require("tui-image-editor/dist/svg/icon-d.svg");
// const myTheme = {
//   "menu.backgroundColor": "white",
//   "common.backgroundColor": "#151515",
//   "downloadButton.backgroundColor": "white",
//   "downloadButton.borderColor": "white",
//   "downloadButton.color": "black",
//   "menu.normalIcon.path": icond,
//   "menu.activeIcon.path": iconb,
//   "menu.disabledIcon.path": icona,
//   "menu.hoverIcon.path": iconc,
// };
// export default function EditPhoto(props) {
//   const [imageSrc] = useState(props.image);
//   const imageEditor = React.createRef();
//   const [cookies] = useCookies(["author"]);
//   var uploadProgress;

//   function dataURItoBlob(dataURI) {
//     // convert base64/URLEncoded data component to raw binary data held in a string
//     var byteString;
//     if (dataURI.split(",")[0].indexOf("base64") >= 0)
//       byteString = atob(dataURI.split(",")[1]);
//     else byteString = unescape(dataURI.split(",")[1]);

//     // separate out the mime component
//     var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

//     // write the bytes of the string to a typed array
//     var ia = new Uint8Array(byteString.length);
//     for (var i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }

//     return new Blob([ia], { type: mimeString });
//   }

//   const saveImage = () => {
//     const imageEditorInst = imageEditor.current.imageEditorInst;
//     var data = imageEditorInst.toDataURL();

//     console.log(dataURItoBlob(data));

//     // if (data) {
//     //   const formData = new FormData();
//     //   data = dataURItoBlob(data)
//     //   formData.append("file", data);
//     //   formData.append("upload_preset", "oms6f6zi");
//     //   formData.append("id", props.node.id);

//     //   Axios.post(
//     //     "https://api.cloudinary.com/v1_1/dqwu1p8fp/image/upload",
//     //     formData,
//     //     {
//     //       onUploadProgress: (progressEvent) => {
//     //         uploadProgress = progressEvent.lengthComputable
//     //           ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
//     //           : 0;
//     //         $("div.progress-bar").css("width", `${uploadProgress}%`);
//     //       },
//     //     }
//     //   ).then((Response) => {
//     //     //save it to extradetails db as filename: `${Response.data.public_id}.${Response.data.format}`
//     //     let photo_id_string;
//     //     try {
//     //       if (props.node.extradetails.photo_id) {
//     //         photo_id_string = `${props.node.extradetails.photo_id},${Response.data.public_id}`;
//     //       } else {
//     //         photo_id_string = Response.data.public_id;
//     //       }
//     //     } catch {
//     //       photo_id_string = Response.data.public_id;
//     //     }

//     //     let obj = props.node;
//     //     if (!obj.extradetails) obj.extradetails = {};
//     //     obj.extradetails.photo_id = photo_id_string;
//     //     props.update(obj);

//     //     Axios.put("https://layfamily.herokuapp.com/api/updateextra", {
//     //       id: Number(props.node.id),
//     //       name: props.node.name,
//     //       photo_id: photo_id_string,
//     //       author: cookies.author,
//     //     });
//     //   });
//     //   cancel();
//     // }
//   };

//   const cancel = () => {
//     props.setImage(undefined);
//   };

//   let saveButton = document.createElement("button"),
//     cancelButton = document.createElement("button");

//   saveButton.margin = "0px 10px";
//   saveButton.textContent = "Save changes";
//   cancelButton.textContent = "Cancel";

//   saveButton.addEventListener("click", saveImage);
//   cancelButton.addEventListener("click", cancel);

//   setTimeout(() => {
//     $(".tui-image-editor-header-buttons")
//       .html("")
//       .append("div")
//       .append(cancelButton);
//     $(".tui-image-editor-header-buttons").append(saveButton);
//   }, 100);

//   return (
//     <div className="image-editor-container">
//       <ImageEditor
//         includeUI={{
//           loadImage: {
//             path: imageSrc,
//             name: "image",
//           },
//           theme: myTheme,
//           menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter"],
//           initMenu: "",
//           uiSize: {
//             height: `100vh`,
//           },
//           menuBarPosition: "left",
//           toggleHistoryMenu: false,
//         }}
//         cssMaxHeight={window.innerHeight}
//         cssMaxWidth={window.innerWidth}
//         selectionStyle={{
//           cornerSize: 20,
//           rotatingPointOffset: 70,
//         }}
//         usageStatistics={false}
//         ref={imageEditor}
//       />
//     </div>
//   );
// }
