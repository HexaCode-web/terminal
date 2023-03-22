import { React, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import loadingLight from "../assets/loading.gif";
import DB from "../DBConfig.json";
import sortBy from "sort-by";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function Products(props) {
  let id;
  const [newProduct, setNewProduct] = useState({
    title: "",
    brand: "",
    category: "",
    description: "",
    stock: 0,
    Offer: false,
    discountPercentage: 0,
    HotProduct: false,
    cost: 0,
    price: 0,
    Stars: 0,
    UsersRated: [],
    rating: 0,
    thumbnail: "",
    images: [],
  });
  const [urlDone, setUrlDone] = useState("false");
  const [status, setStatus] = useState(false);
  props.Data.sort(sortBy("id"));
  const handleInput = (event) => {
    props.Data.forEach((product) => {
      id = product.id + 1;
    });
    let { name, value, type } = event.target;
    if (type === "number") {
      value = +value;
    }
    let filesAR = [];
    if (name === "thumbnail") {
      const imageRef = ref(storage, `images/${newProduct.id}/thumbnail`);
      uploadBytes(imageRef, event.target.files[0]).then(async (snapshot) => {
        console.log("uploaded");
        await getDownloadURL(snapshot.ref).then((url) => {
          setNewProduct((prev) => {
            return { ...prev, id: id, thumbnail: url };
          });
        });
      });
    }
    if (name === "images") {
      filesAR = Array.from(event.target.files);
      let urlList = [];
      filesAR.forEach((element, index) => {
        setUrlDone("pending");
        const imageRef = ref(storage, `images/${newProduct.id}/${index}`);
        uploadBytes(imageRef, element).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            urlList.push({ index, url });
            if (urlList.length === filesAR.length) {
              setUrlDone("true");
            }
            setNewProduct((prev) => {
              return { ...prev, id: id, images: urlList };
            });
          });
        });
      });
    }
    if (name === "Offer") {
      if (value === "true") {
        value = true;
      } else {
        value = false;
      }
      setNewProduct((prev) => {
        return { ...prev, Offer: value };
      });
    }
    if (name === "HotProduct") {
      setNewProduct((prev) => {
        return { ...prev, HotProduct: value === "true" ? true : false };
      });
    } else {
      setNewProduct((prev) => {
        return {
          ...prev,
          id: id,
          [name]: value,
        };
      });
    }
  };

  const add = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "products", newProduct.id.toString()), newProduct);
    window.location.reload();
  };
  useEffect(() => {
    switch (urlDone) {
      case "false":
        setStatus(<p className="alert">Please Upload some photos</p>);
        break;
      case "true":
        setStatus(
          <input required type="submit" value="Add" onClick={add}></input>
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

  const productListEL = props.ProductData.map((Product) => {
    const discount = Math.round(
      Product.price - (Product.price * Product.discountPercentage) / 100
    );
    return (
      <tr>
        <th scope="row" className="d-none">
          {Product.id}
        </th>
        <td>{Product.title}</td>
        <td>{Product.brand}</td>
        <td>{Product.category}</td>
        <td>{Product.Offer ? "YES" : "NO"}</td>
        <td>{Product.HotProduct ? "Yes" : "NO"}</td>
        <td>{Product.cost}$</td>
        <td>{Product.price}$</td>
        <td>{Product.discountPercentage}%</td>
        <td>{discount}$</td>
        <td>{Product.stock}</td>
        <td>{Product.rating}</td>
        <td>{Product.Stars}</td>
        <td>{Product.UsersRated ? Product.UsersRated.length : 0}</td>
        <td>
          <button
            className="btn btn-secondary"
            onClick={() => {
              window.location.replace(`User/product/${Product.id}`);
            }}
          >
            Details
          </button>
        </td>
      </tr>
    );
  });
  const catagoriesSelect = props.catagories.map((catagory) => {
    return <option value={catagory.Name}>{catagory.Name}</option>;
  });
  return (
    <div className="Products">
      <h1>Products</h1>
      <button
        type="button"
        className="btn btn-primary Add"
        data-bs-toggle="modal"
        data-bs-target="#AddNewProduct"
      >
        Add a new Product
      </button>
      <span style={{ textAlign: "center", fontSize: "10px" }}>
        Hint: scroll the table with Shift + scroll wheel
      </span>
      <div className="table-responsive">
        <table class="table table-dark table-striped text-center">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">brand</th>
              <th scope="col">category</th>
              <th scope="col">Offer</th>
              <th scope="col">HotProduct</th>
              <th scope="col">cost</th>
              <th scope="col">price Before Discount</th>
              <th scope="col">discountPercentage</th>
              <th scope="col">price After Discount</th>
              <th scope="col">stock</th>
              <th scope="col">rating</th>
              <th scope="col">Stars Got</th>
              <th scope="col">Users Rated</th>
              <th scope="col">View Product Details</th>
            </tr>
          </thead>
          <tbody>{productListEL}</tbody>
        </table>
      </div>
      <div
        className="modal fade AddProduct"
        id="AddNewProduct"
        tabIndex="-1"
        aria-labelledby="AddNewProduct"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                style={{ color: "black" }}
                className="modal-title fs-5"
                id="exampleModalLabel"
              >
                Add a new Product
              </h2>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form className="newProduct">
                <div className="formItem">
                  <label htmlFor="title">Product's name:</label>
                  <input
                    required
                    type="text"
                    id="title"
                    name="title"
                    value={newProduct.title}
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem">
                  <label htmlFor="brand">Product's brand:</label>
                  <input
                    required
                    type="text"
                    id="brand"
                    name="brand"
                    value={newProduct.brand}
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem">
                  <label htmlFor="category">Product's category:</label>
                  <select
                    name="category"
                    id="category"
                    value={newProduct.category}
                    onChange={handleInput}
                  >
                    <option value=""></option>
                    {catagoriesSelect}
                  </select>
                </div>
                <div className="formItem">
                  <label htmlFor="description">Product's description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInput}
                  ></textarea>
                </div>
                <div className="select-wrapper">
                  <label htmlFor="Offer"> Offer?</label>
                  <div style={{ display: "flex", gap: "50px" }}>
                    <div className="form-check" id="Offer">
                      <input
                        required
                        className="form-check-input"
                        type="radio"
                        name="Offer"
                        id="offerYES"
                        value={true}
                        onChange={handleInput}
                      />
                      <label className="form-check-label" htmlFor="offerYES">
                        Yes
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        required
                        className="form-check-input"
                        type="radio"
                        name="Offer"
                        id="offerNO"
                        value={false}
                        onChange={handleInput}
                      />
                      <label className="form-check-label" htmlFor="offerNO">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {newProduct.Offer ? (
                  <div className="formItem">
                    <label htmlFor="Discount">Discount percentage:</label>
                    <input
                      required
                      type="number"
                      id="Discount"
                      name="discountPercentage"
                      value={newProduct.discountPercentage}
                      onChange={handleInput}
                    ></input>
                  </div>
                ) : (
                  ""
                )}
                <div className="select-wrapper">
                  <label htmlFor="HotProduct"> Hot Product List?</label>
                  <div style={{ display: "flex", gap: "50px" }}>
                    <div className="form-check" id="Hot">
                      <input
                        required
                        className="form-check-input"
                        type="radio"
                        name="HotProduct"
                        id="HotYes"
                        value={true}
                        onChange={handleInput}
                      />
                      <label className="form-check-label" htmlFor="HotYes">
                        Yes
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        required
                        className="form-check-input"
                        type="radio"
                        name="HotProduct"
                        id="HotNo"
                        value={false}
                        onChange={handleInput}
                      />
                      <label className="form-check-label" htmlFor="HotNo">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                <div className="formItem">
                  <label htmlFor="Price">Product's COST:</label>
                  <input
                    min={0}
                    required
                    type="number"
                    id="Price"
                    name="cost"
                    value={newProduct.cost}
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem">
                  <label htmlFor="Price">Product's Price:</label>
                  <input
                    min={0}
                    required
                    type="number"
                    id="price"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem">
                  <label htmlFor="stock">Product's stock:</label>
                  <input
                    required
                    type="number"
                    id="stock"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem photo">
                  <label htmlFor="image">Product's Thumbnail:</label>
                  <input
                    required
                    style={{ maxWidth: "119px" }}
                    type="file"
                    id="image"
                    name="thumbnail"
                    value=""
                    onChange={handleInput}
                  ></input>
                </div>
                <div className="formItem photo">
                  <label htmlFor="images">Product's photos:</label>
                  <input
                    required
                    style={{ maxWidth: "130px" }}
                    type="file"
                    id="images"
                    name="images"
                    multiple="multiple"
                    value=""
                    onChange={handleInput}
                  ></input>
                </div>
                {status}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
