import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { firebaseConfig } from "../../DBConfig.js";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import Error404 from "../../pages/Error404";
import "react-toastify/dist/ReactToastify.css";
import AddPhoto from "../../assets/addphoto.png";
import secureLocalStorage from "react-secure-storage";
import { CreateToast } from "../../App";
import {
  DELETEDOC,
  GETCOLLECTION,
  GETDOC,
  SETDOC,
  productDistributor,
} from "../../server";
import loading from "../../assets/loading-13.gif";
import "./EditProduct.css";
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default function EditProduct() {
  const [inactive, setInactive] = React.useState(false);
  const id = useParams().ID;
  const [Product, setProduct] = React.useState({});
  const [Error, setError] = React.useState(false);
  const [categories, SetCategories] = React.useState([]);
  const [activeImg, setActiveImg] = React.useState("");
  const validateUser = async () => {
    const activeUser = JSON.parse(secureLocalStorage.getItem("activeUser"));
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
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
    const getCate = async () => {
      await GETCOLLECTION("categories").then((res) => {
        SetCategories(res);
      });
    };
    getCate();
  }, []);
  useEffect(() => {
    GETDOC("products", id).then((res) => {
      setProduct(res);
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
  const Delete = async (e) => {
    e.preventDefault();
    if (confirm("are you sure you want to delete this product?")) {
      setInactive(true);
      for (let index = 0; index < Product.images.length; index++) {
        await deleteObject(
          ref(storage, `/images/${id}/${Product.images[index].index}`)
        );
      }
      await getDownloadURL(ref(storage, `/images/${id}/thumbnail`)).then(
        (res) => {
          if (res) {
            deleteObject(ref(storage, `/images/${id}/thumbnail`));
          } else {
            return;
          }
        }
      );
      await DELETEDOC("products", id);
      setInactive(false);
      alert("product has been deleted");
      window.location.href = "/User";
    } else {
      return;
    }
  };
  const UpdateProduct = async (e) => {
    e.preventDefault();
    CreateToast("Updating...", "info");
    let firstProduct;
    let SecondProduct;
    await GETDOC("websiteData", "mainProduct1").then(
      (res) => (firstProduct = res.mainProduct1)
    );

    await GETDOC("websiteData", "mainProduct2").then(
      (res) => (SecondProduct = res.mainProduct2)
    );

    if (firstProduct.id == id) {
      console.log(firstProduct);
      await SETDOC("websiteData", "mainProduct1", { mainProduct1: Product });
    }
    if (SecondProduct.id == id) {
      console.log(SecondProduct);
      await SETDOC("websiteData", "mainProduct2", { mainProduct2: Product });
    }
    await SETDOC("products", id, { ...Product });
    const productList = await GETCOLLECTION("products");
    const catagories = await GETCOLLECTION("categories");
    productDistributor(productList, catagories);
    CreateToast("Product has been updated", "success");
  };
  const DeleteImg = async (url) => {
    CreateToast("photo deleting", "warning");
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
              SETDOC("products", id, { ...Product });
              GETDOC("products", id).then((value) => {
                setProduct(value);
              });
              CreateToast("photo has been deleted", "success");
            })
            .catch((error) => {
              CreateToast(error, "error");
            });
        }
      });
    }
  };
  const MakeThumb = async (ActiveIMG) => {
    await SETDOC("products", id, { ...Product, thumbnail: ActiveIMG });
    CreateToast("changed thumbnail", "success");
  };
  const uploadPhoto = async (event) => {
    const imageRef = ref(
      storage,
      `images/${Product.id}/${Product.images.length}`
    );
    CreateToast("photo uploading", "warning");
    uploadBytes(imageRef, event.target.files[0]).then(async (snapshot) => {
      console.log("uploaded");
      await getDownloadURL(snapshot.ref).then((url) => {
        Product.images.push({ index: Product.images.length, url: url });
        SETDOC("products", id, { ...Product });
        GETDOC("products", id).then((value) => {
          setProduct(value);
        });
        CreateToast("photo uploaded", "success");
      });
    });
  };
  const Options = categories.map((category) => {
    return <option value={category.Name}>{category.Name}</option>;
  });
  return (
    <>
      {inactive && (
        <div className="Inactive">
          <img src={loading} />
        </div>
      )}
      {Error ? (
        <Error404 />
      ) : (
        <div className="EditProduct">
          <button
            onClick={() => {
              window.location.href = "/Dashboard";
            }}
          >
            Go Back
          </button>
          <div className="Images">
            <div style={{ position: "relative" }}>
              <img src={activeImg ? activeImg : ""} className="MainIMG"></img>
              {activeImg && (
                <div className="ButtonWrapper">
                  <button
                    className="Delete"
                    onClick={() => {
                      DeleteImg(activeImg);
                    }}
                  >
                    Delete Photo
                  </button>
                  <button
                    className="Thumbnail"
                    onClick={() => {
                      MakeThumb(activeImg);
                    }}
                  >
                    Make Thumbnail
                  </button>
                </div>
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
            <div className="form-group" id="Title">
              <label htmlFor="title">Title:</label>
              <input
                value={Product.title}
                type="text"
                id="title"
                name="title"
                required
                onChange={handleInput}
              />
            </div>
            <div className="form-group" id="Brand">
              <label htmlFor="brand">Brand:</label>
              <input
                value={Product.brand}
                type="text"
                id="brand"
                name="brand"
                required
                onChange={handleInput}
              />
            </div>
            <div className="form-group" id="Category">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={Product.category}
                required
                onChange={handleInput}
                style={{ color: "white", backgroundColor: "black" }}
              >
                <option value="">--Please select a category--</option>
                {Options}
              </select>
            </div>

            <div className="form-group" id="Description">
              <label htmlFor="description">Description:</label>
              <textarea
                value={Product.description}
                id="description"
                name="description"
                required
                onChange={handleInput}
              ></textarea>
            </div>

            <div className="form-group" id="Stock">
              <label htmlFor="stock">Stock:</label>
              <input
                value={Product.stock}
                type="number"
                id="stock"
                name="stock"
                min="0"
                required
                onChange={handleInput}
              />
              <p>(increase to add Stock)</p>
            </div>

            <div className="form-group" id="Offer">
              <label htmlFor="Offer">Offer?</label>
              <input
                checked={Product.Offer}
                type="checkbox"
                id="Offer"
                name="Offer"
                onChange={handleInput}
              />
            </div>

            {Product.Offer && (
              <div className="form-group" id="Discount">
                <label htmlFor="discount">Discount:</label>
                <input
                  value={Product.discountPercentage}
                  type="number"
                  id="discount"
                  name="discountPercentage"
                  min="0"
                  max="100"
                  onChange={handleInput}
                />
                <p>(calculated by Percentage)</p>
              </div>
            )}
            <div className="form-group" id="Cost">
              <label htmlFor="cost">Cost:</label>
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

            <div className="form-group" id="Price">
              <label htmlFor="price">Selling Price:</label>
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

            <div className="form-group" id="Hot-product">
              <label htmlFor="HotProduct">Hot Product?</label>
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
            <button
              className="btn btn-danger"
              id="Delete"
              onClick={(e) => {
                Delete(e);
              }}
            >
              Delete Product
            </button>
          </form>
          <div className="Section2">
            <h3>Additional Info</h3>
            <div className="OtherInfo">
              <p>Stars Got: {Product.Stars}</p>
              <p>Total Rating Got: {Product.rating}</p>
              <p>
                Number of Users Rated :{" "}
                {Product.UsersRated ? Product.UsersRated.length : ""}
              </p>
              <p>Amount of Times Sold : {Product.Sold}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
