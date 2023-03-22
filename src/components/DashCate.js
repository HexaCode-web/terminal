import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import DB from "../DBConfig.json";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import loadingLight from "../assets/loading.gif";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export default function DashCate(props) {
  const [newCate, setNewCate] = React.useState({ Name: "", URL: "" });
  const [status, setStatus] = React.useState(false);
  const [urlDone, setUrlDone] = React.useState("false");
  const handleInput = (event) => {
    let { name, value } = event.target;
    if (name === "icon") {
      setUrlDone("pending");
      const imageRef = ref(storage, `images/icons/${newCate.Name}`);
      uploadBytes(imageRef, event.target.files[0]).then(async (snapshot) => {
        console.log("uploaded");
        await getDownloadURL(snapshot.ref).then((url) => {
          setNewCate((prev) => {
            return { ...prev, URL: url };
          });
          setUrlDone("true");
        });
      });
    } else {
      setNewCate((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };
  const addCate = async () => {
    await getDoc(doc(db, "statistics", "1")).then((res) => {
      let catagories = res.data().catagories;
      catagories[newCate.Name] = [];
      setDoc(doc(db, "statistics", "1"), { catagories });
    });
    await getDoc(doc(db, "statistics", "2")).then((res) => {
      let categoriesIcons = res.data().categoriesIcons;
      categoriesIcons[newCate.Name] = newCate.URL;
      setDoc(doc(db, "statistics", "2"), { categoriesIcons });
    });
    window.location.reload();
  };
  React.useEffect(() => {
    switch (urlDone) {
      case "false":
        setStatus(<p className="alert">Please Upload an icon</p>);
        break;
      case "true":
        setStatus(
          <input
            required
            type="submit"
            className="btn"
            value="Add"
            onClick={addCate}
          ></input>
        );
        break;
      case "pending":
        setStatus(
          <img
            alt="loading"
            src={loadingLight}
            style={{ margin: "auto", width: "50px" }}
          />
        );
        break;
      default:
        break;
    }
  }, [urlDone]);
  const CategoriesEL = props.catagories.map((category) => {
    return (
      <tr>
        <td>{category.Name}</td>
        <td>
          <img src={category.icon}></img>
        </td>
      </tr>
    );
  });
  return (
    <div className="Categories">
      <h1>Categories</h1>
      <button
        type="button"
        class="btn Modal"
        data-bs-toggle="modal"
        data-bs-target="#AddCate"
      >
        Add Category
      </button>
      <div
        class="modal fade"
        id="AddCate"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="AddCate"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2
                style={{ color: "black" }}
                className="modal-title fs-5"
                id="exampleModalLabel"
              >
                Add a new category
              </h2>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setUrlDone("false")}
              ></button>
            </div>
            <div class="modal-body">
              <form className="AddAdmin-form">
                <div className="formItem">
                  <label for="Name">Name:</label>
                  <input
                    type="text"
                    id="Name"
                    name="Name"
                    value={newCate.Name}
                    onChange={handleInput}
                  />
                </div>
                <div className="formItem">
                  <label for="icon">icon:</label>
                  <input
                    disabled={newCate.Name ? false : true}
                    type="file"
                    accept="image/png, image/jpeg"
                    id="icon"
                    name="icon"
                    onChange={handleInput}
                  />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                onClick={() => setUrlDone("false")}
              >
                Close
              </button>
              {status}
            </div>
          </div>
        </div>
      </div>
      <span style={{ textAlign: "center", fontSize: "10px" }}>
        Hint: scroll the table with Shift + scroll wheel
      </span>
      {props.catagories && (
        <div className="table-responsive">
          <table class="table table-dark table-striped text-center">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Photo</th>
              </tr>
            </thead>
            <tbody>{CategoriesEL}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
