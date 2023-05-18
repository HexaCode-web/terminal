import React, { useEffect, useState } from "react";
import ProductSelect from "./ProductSelect";
import Upload from "../../assets/upload.png";
import { CreateToast } from "../../App";
import { UPLOADPHOTO } from "../../server";
import "./ExtraLists.css";
const ExtraListEdit = (props) => {
  const [List, SetList] = useState(props.List);
  const [listNumber, setListNumber] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const handleProductChange = (selectedOption) => {
    SetList((prev) => {
      return { ...prev, Products: selectedOption };
    });
  };
  useEffect(() => {
    switch (props.ListNum) {
      case "First":
        setListNumber("ExtraOne");
        break;
      case "Second":
        setListNumber("ExtraTwo");
        break;
      case "Third":
        setListNumber("ExtraThree");
        break;
      case "Fourth":
        setListNumber("ExtraFour");
        break;
      default:
        break;
    }
  }, []);
  const HandleInput = async (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "file") {
      let url;
      setUploadingPhoto(true);
      CreateToast("Uploading", "progress", 3000);
      url = await UPLOADPHOTO(
        `images/customize/${listNumber}`,
        e.target.files[0]
      );
      SetList((prev) => {
        return { ...prev, URL: url };
      });
      CreateToast("uploaded", "success");

      setUploadingPhoto(false);
    } else if (type === "checkbox") {
      SetList((prev) => {
        return { ...prev, [name]: checked };
      });
    } else {
      SetList((prev) => {
        return { ...prev, [name]: value };
      });
    }
  };
  const handleSave = () => {
    props.SaveExtraList("List", List, listNumber);
  };

  return (
    <div className="ExtraList">
      <h4>{props.ListNum} List</h4>
      <div className="FormItem" id="Show">
        <label>
          <input
            name="Show"
            type="checkbox"
            checked={List.Show}
            onChange={HandleInput}
          />
          Show List
        </label>
      </div>
      <div className="FormItem" id="title">
        <label htmlFor="Title">List Name:</label>
        <input
          type="text"
          name="Title"
          id="Title"
          value={List.Title}
          onChange={HandleInput}
        />
      </div>
      <div className="FormItem" id="Photo">
        <label>
          <input
            name="ShowPhoto"
            type="checkbox"
            checked={List.ShowPhoto}
            onChange={HandleInput}
          />
          Show Photo
        </label>
      </div>
      {List.ShowPhoto && (
        <div className="FormItem" id="upload">
          <span>Upload Photo:</span>
          <label htmlFor={listNumber}>
            <img src={Upload} />
          </label>
          <input
            disabled={uploadingPhoto ? true : false}
            onChange={HandleInput}
            name="URL"
            type="file"
            accept="image"
            id={listNumber}
            style={{ display: "none" }}
          />
        </div>
      )}
      <div className="FormItem" id="select">
        <h6>Select Products:</h6>
        <ProductSelect
          options={props.SortedProducts}
          value={List.Products}
          onChange={handleProductChange}
          source="ExtraOne"
        />
      </div>
      <button
        disabled={uploadingPhoto ? true : false}
        className="button"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default ExtraListEdit;
