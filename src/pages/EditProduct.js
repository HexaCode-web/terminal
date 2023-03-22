import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import DB from "../DBConfig.json";
import { initializeApp } from "firebase/app";
import { collection, getFirestore, getDocs } from "firebase/firestore";
import {
  getStorage,
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import DeletePhoto from "../assets/delete.png";
import Error404 from "./Error404";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddPhoto from "../assets/addphoto.png";
import secureLocalStorage from "react-secure-storage";
const app = initializeApp(DB.firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export default function EditProduct(props) {
  const id = useParams().ID;
  const [Product, setProduct] = React.useState({});
  const [Error, setError] = React.useState(false);
  const [activeImg, setActiveImg] = React.useState("");
  const validateUser = async () => {
    const activeUser = JSON.parse(secureLocalStorage.getItem("activeUser"));
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
    });
    cleanData.forEach((user) => {
      if (user.Username === activeUser.Username) {
        if (!user.admin) {
          setError(true);
        }
      }
    });
  };
  useEffect(() => {
    props.getProduct(id).then((value) => {
      setProduct(value);
    });
    validateUser();
  }, []);
  useEffect(() => {
    setActiveImg(Product.images ? Product.images[0].url : "");
  }, [Product]);
  const setMainImage = (e) => {
    setActiveImg(e.target.src);
  };
  const photosEL = Product.images
    ? Product.images.map((photo) => {
        return (
          <button
            className={`thumb ${activeImg === photo ? "active" : ""}`}
            onClick={setMainImage}
          >
            <img src={photo.url} />
          </button>
        );
      })
    : "";
  const handleInput = (event) => {
    let { name, value, type, checked } = event.target;
    if (type === "number") {
      value = +value;
    }
    if (name === "Offer") {
      checked ? (value = true) : (value = false);
      setProduct((prev) => {
        return { ...prev, Offer: value };
      });
    }
    if (name === "HotProduct") {
      setProduct((prev) => {
        return { ...prev, HotProduct: checked ? true : false };
      });
    } else {
      setProduct((prev) => {
        return {
          ...prev,

          [name]: value,
        };
      });
    }
  };
  const UpdateProduct = (e) => {
    e.preventDefault();
    props.UpdateProduct(id.toString(), Product);
    toast.success("Product has been updated", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };
  const DeleteImg = async (url) => {
    toast.warning("photo deleting", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "black",
    });
    const targetImg = Product.images.find((imageObject) => {
      if (imageObject.url === url) return imageObject;
    });
    if (targetImg) {
      Product.images.forEach((image, index) => {
        if (targetImg.index === image.index) {
          Product.images.splice(index, 1);
          const desertRef = ref(storage, `images/${id}/${targetImg.index}`);
          deleteObject(desertRef)
            .then(() => {
              props.UpdateProduct(id.toString(), Product);

              props.getProduct(id).then((value) => {
                setProduct(value);
              });
              toast.success("photo has been deleted", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
            })
            .catch((error) => {
              toast.error(
                "something went wrong,please refresh the page and try again",
                {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                }
              );
            });
        }
      });
    }
  };
  const uploadPhoto = async (event) => {
    const imageRef = ref(
      storage,
      `images/${Product.id}/${Product.images.length}`
    );
    toast.warning("photo uploading", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "black",
    });
    uploadBytes(imageRef, event.target.files[0]).then(async (snapshot) => {
      console.log("uploaded");
      await getDownloadURL(snapshot.ref).then((url) => {
        Product.images.push({ index: Product.images.length, url: url });
        props.UpdateProduct(id.toString(), Product);
        props.getProduct(id).then((value) => {
          setProduct(value);
        });
        toast.success("photo uploaded", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });
    });
  };
  return (
    <>
      {Error ? (
        <Error404 />
      ) : (
        <div className="EditProduct">
          <div className="Images">
            <div style={{ position: "relative" }}>
              <img src={activeImg ? activeImg : ""} className="MainIMG"></img>
              {activeImg && (
                <button
                  className="DeleteBtn"
                  onClick={() => {
                    DeleteImg(activeImg);
                  }}
                >
                  <img src={DeletePhoto}></img>
                </button>
              )}
            </div>
            <div className="ThumbPhotos">
              {photosEL}
              <label htmlFor="AddPhotoBTN" className="addPhoto">
                <img src={AddPhoto}></img>
              </label>
              <input
                type="file"
                id="AddPhotoBTN"
                className="d-none"
                accept="image/png, image/jpeg"
                onChange={uploadPhoto}
              ></input>
            </div>
          </div>
          <form className="ProductInfo">
            <div class="form-group" id="Title">
              <label for="title">Title:</label>
              <input
                value={Product.title}
                type="text"
                id="title"
                name="title"
                required
                onChange={handleInput}
              />
            </div>
            <div class="form-group" id="Brand">
              <label for="brand">Brand:</label>
              <input
                value={Product.brand}
                type="text"
                id="brand"
                name="brand"
                required
                onChange={handleInput}
              />
            </div>
            <div class="form-group" id="Category">
              <label for="category">Category:</label>
              <select
                id="category"
                name="category"
                value={Product.category}
                required
                onChange={handleInput}
                style={{ color: "white", backgroundColor: "black" }}
              >
                <option value="">--Please select a category--</option>
                <option value="smartphones">smartphones</option>
                <option value="Tv">Tv</option>
                <option value="Monitor">Monitor</option>
                <option value="laptops">laptops</option>
                <option value="watches">watches</option>
              </select>
            </div>

            <div class="form-group" id="Description">
              <label for="description">Description:</label>
              <textarea
                value={Product.description}
                id="description"
                name="description"
                required
                onChange={handleInput}
              ></textarea>
            </div>

            <div class="form-group" id="Stock">
              <label for="stock">Stock:</label>
              <input
                value={Product.stock}
                type="number"
                id="stock"
                name="stock"
                min="0"
                required
                onChange={handleInput}
              />
              <p style={{ textAlign: "center" }}>(increase to add Stock)</p>
            </div>

            <div class="form-group" id="Offer">
              <label for="Offer">Offer?</label>
              <input
                checked={Product.Offer}
                type="checkbox"
                id="Offer"
                name="Offer"
                onChange={handleInput}
              />
            </div>

            {Product.Offer && (
              <div class="form-group" id="Discount">
                <label for="discount">Discount:</label>
                <input
                  value={Product.discountPercentage}
                  type="number"
                  id="discount"
                  name="discount"
                  min="0"
                  max="100"
                  onChange={handleInput}
                />
                <p style={{ textAlign: "center" }}>
                  (calculated by Percentage)
                </p>
              </div>
            )}
            <div class="form-group" id="Cost">
              <label for="cost">Cost:</label>
              <input
                value={Product.cost}
                type="number"
                id="cost"
                name="cost"
                min="0"
                step="0.01"
                onChange={handleInput}
              />
            </div>

            <div class="form-group" id="Price">
              <label for="price">Selling Price:</label>
              <input
                value={Product.price}
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                required
                onChange={handleInput}
              />
            </div>

            <div class="form-group" id="Hot-product">
              <label for="HotProduct">Hot Product?</label>
              <input
                checked={Product.HotProduct}
                type="checkbox"
                id="HotProduct"
                name="HotProduct"
                onChange={handleInput}
              />
            </div>

            <input
              type="submit"
              value="Save"
              id="Submit"
              onClick={(e) => {
                UpdateProduct(e);
              }}
            />
          </form>
        </div>
      )}
    </>
  );
}
