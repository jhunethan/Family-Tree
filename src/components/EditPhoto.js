// import React, { useState } from "react";
// import "../css/EditPhoto.css";
// import * as $ from "jquery";
// import Axios from "axios";
// import ReactCrop from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";
// import { useCookies } from "react-cookie";

// export default function EditPhoto(props) {
//   const [imageSrc] = useState(props.image);
//   const [cookies] = useCookies(["author"]);
//   var uploadProgress;

//   //   function dataURItoBlob(dataURI) {
//   //     // convert base64/URLEncoded data component to raw binary data held in a string
//   //     var byteString;
//   //     if (dataURI.split(",")[0].indexOf("base64") >= 0)
//   //       byteString = atob(dataURI.split(",")[1]);
//   //     else byteString = unescape(dataURI.split(",")[1]);

//   //     // separate out the mime component
//   //     var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

//   //     // write the bytes of the string to a typed array
//   //     var ia = new Uint8Array(byteString.length);
//   //     for (var i = 0; i < byteString.length; i++) {
//   //       ia[i] = byteString.charCodeAt(i);
//   //     }

//   //     return new Blob([ia], { type: mimeString });
//   //   }

//   const saveImage = () => {
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

//   return (
//     <div className="image-editor-container">
//       <h1 className="image-editor-title">Image editor</h1>
//       <div className="image-editor">
//         <ReactCrop
//           src={imageSrc}
//           crop={{
//             width: 10,
//             aspect: 1 / 1,
//           }}
//         />
//       </div>
//     </div>
//   );
// }

import React, { PureComponent } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import "../css/EditPhoto.css";

export default class EditPhoto extends PureComponent {
  state = {
    src: null,
    crop: {
      unit: "%",
      width: 50,
      aspect: 1 / 1,
    },
  };

  onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        this.setState({ src: reader.result })
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // If you setState the crop in here you should return false.
  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  onCropComplete = (crop) => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg");
    });
  }

  render() {
    const { crop, croppedImageUrl, src } = this.state;

    return (
      <div className="image-editor-container">
        <h1 className="image-editor-title">Image editor</h1>
        <div className="image-editor">
          <div>
            <input type="file" accept="image/*" onChange={this.onSelectFile} />
          </div>
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              ruleOfThirds
              onImageLoaded={this.onImageLoaded}
              onComplete={this.onCropComplete}
              onChange={this.onCropChange}
            />
          )}
          {croppedImageUrl && (
            <img
              alt="Crop"
              style={{ maxHeight: "100%" }}
              src={croppedImageUrl}
            />
          )}
        </div>
      </div>
    );
  }
}
