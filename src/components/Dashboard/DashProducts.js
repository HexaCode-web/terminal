import { React, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import loadingLight from "../../assets/loading-13.gif";
import { firebaseConfig } from "../../DBConfig.js";
import sortBy from "sort-by";
import { SETDOC } from "../../server";
import { CreateToast } from "../../App";
import DataTable from "react-data-table-component";
import "./DashProducts.css";
const app = initializeApp(firebaseConfig);
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
    console.log(newProduct);
    props.Data.forEach((product) => {
      id = +product.id + 1;
    });
    let { name, value, type } = event.target;
    if (type === "number") {
      value = +value;
    }
    let filesAR = [];
    if (name === "thumbnail") {
      CreateToast("uploading thumbnail", "progress");
      const imageRef = ref(storage, `images/${newProduct.id}/thumbnail`);
      uploadBytes(imageRef, event.target.files[0]).then(async (snapshot) => {
        console.log("uploaded");
        CreateToast("uploaded the thumbnail", "success");
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
              CreateToast("uploaded photos", "success");
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
    await SETDOC("products", newProduct.id, { ...newProduct }, true);

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

  const catagoriesSelect = props.catagories.map((category) => {
    return <option value={category.Name}>{category.Name}</option>;
  });

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: "Brand",
      selector: (row) => row.brand,
      sortable: true,
      center: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      center: true,
    },
    {
      name: "Offer",
      selector: (row) => row.offer,
      sortable: true,
      width: "90px",
      center: true,
    },
    {
      name: "Hot",
      width: "100px",
      selector: (row) => row.hotProduct,
      center: true,
    },
    {
      name: "Cost",
      width: "70px",
      selector: (row) => row.cost,
      center: true,
    },
    {
      name: "price before discount",
      width: "170px",
      selector: (row) => row.priceBefore,
      center: true,
    },
    {
      name: "Discount",
      width: "100px",
      selector: (row) => row.discount,
      center: true,
    },
    {
      name: "price After Discount	",
      width: "160px",
      selector: (row) => row.priceAfter,
      center: true,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      width: "70px",
      conditionalCellStyles: [
        {
          when: (row) => row.stock < 5,
          style: {
            backgroundColor: "red",
            color: "white",
            "&:hover": {
              cursor: "pointer",
            },
          },
        },
      ],
      center: true,
    },
    {
      name: "Details",
      selector: (row) => row.Details,
      center: true,
    },
  ];
  const data = props.ProductData.map((Product) => {
    const discount = (
      Product.price -
      (Product.price * Product.discountPercentage) / 100
    ).toFixed(2);
    return {
      name: Product.title,
      brand: Product.brand,
      category: Product.category,
      offer: Product.Offer ? "YES" : "NO",
      hotProduct: Product.HotProduct ? "YES" : "NO",
      cost: Product.cost,
      priceBefore: Product.price,
      discount: Product.discountPercentage,
      priceAfter: discount,
      stock: Product.stock,
      Details: (
        <button
          className="button"
          onClick={() => {
            window.location.href = `/Dashboard/product/${Product.id}`;
          }}
        >
          Details
        </button>
      ),
    };
  });
  return (
    <div className="Products">
      <h1 className="animate__animated animate__backInDown">Products</h1>
      <button
        type="button"
        className="button Add animate__animated animate__backInUp"
        style={{ animationDelay: ".4s" }}
        data-bs-toggle="modal"
        data-bs-target="#AddNewProduct"
      >
        Add a new Product
      </button>
      <DataTable
        pagination
        highlightOnHover
        theme={localStorage.getItem("darkMode") ? "Light" : "dark"}
        columns={columns}
        data={data}
      />
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
