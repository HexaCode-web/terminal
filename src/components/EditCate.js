import { React, useState, useEffect } from "react";
import {
  GETDOC,
  SETDOC,
  DELETEDOC,
  GETCOLLECTION,
  productDistributor,
  UPLOADPHOTO,
} from "../server";

import loadingDark from "../assets/loadingDark.gif";
import { CreateToast } from "../App";
export default function EditCate(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [Category, setCategory] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [ranOnce, setRanOnce] = useState(false);
  function ChangeFormat(color, result) {
    if (result === "Hex") {
      const rgbaValues = color.match(/\d+/g);
      const r = parseInt(rgbaValues[0]);
      const g = parseInt(rgbaValues[1]);
      const b = parseInt(rgbaValues[2]);
      const hexValue = ((r << 16) | (g << 8) | b).toString(16);
      return "#" + ("000000" + hexValue).slice(-6);
    }
    if (result === "RGBA") {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      return result
        ? `rgba(${parseInt(result[1], 16)}, ${parseInt(
            result[2],
            16
          )}, ${parseInt(result[3], 16)}, .7)`
        : null;
    }
  }
  useEffect(() => {
    GETDOC("categories", +props.CateID).then((res) => {
      setCategory(res);
      setIsLoading(false);
    });
  }, []);
  useEffect(() => {
    if (Object.keys(Category).length !== 0 && ranOnce === false) {
      setCategory((prev) => {
        return { ...prev, Hex: ChangeFormat(prev.color, "Hex") };
      });
      setRanOnce(true);
    }
  }, [Category]);

  const HandleInput = (event) => {
    const { name, value } = event.target;
    if (name === "Hex") {
      setCategory((prev) => {
        return {
          ...prev,
          [name]: value,
          color: ChangeFormat(value, "RGBA"),
        };
      });
    }
    if (name === "icon") {
      setUploadingPhoto(true);
      CreateToast("Uploading", "progress", 3000);
      UPLOADPHOTO(`images/icons/${Category.Name}`, event.target.files[0]).then(
        (url) => {
          setCategory((prev) => {
            return { ...prev, icon: url };
          });
          CreateToast("uploaded", "success");
          setUploadingPhoto(false);
        }
      );
    } else {
      setCategory((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };
  const update = (e) => {
    e.preventDefault();
    SETDOC("categories", Category.id, { ...Category }).then((error) => {
      if (!error) {
        CreateToast("Updated!", "success");
      } else {
        CreateToast("something went wrong", "error");
      }
    });
  };
  return (
    <div className="Container Cate">
      {isLoading ? (
        <img style={{ width: "50px", margin: "auto" }} src={loadingDark}></img>
      ) : (
        <div style={{ width: "95%" }}>
          <div className="EditCate">
            <h3>Edit The Category</h3>
            <form>
              <div className="formItem">
                <label for="category-name">Category Name:</label>
                <input
                  type="text"
                  id="category-name"
                  name="Name"
                  value={Category.Name}
                  onChange={() => {
                    HandleInput(event);
                  }}
                />
              </div>
              <div className="formItem">
                <label for="category-color">Category Color:</label>
                <input
                  type="color"
                  id="category-color"
                  name="Hex"
                  value={Category.Hex}
                  onChange={() => {
                    HandleInput(event);
                  }}
                />
              </div>
              <div className="formItem">
                <label for="icon">Category Icon:</label>
                <input
                  type="file"
                  id="category-icon"
                  name="icon"
                  accept="image/png, image/jpeg"
                  onChange={() => {
                    HandleInput(event);
                  }}
                />
              </div>
              <div className="formItem">
                <input
                  type="submit"
                  disabled={uploadingPhoto ? true : false}
                  value="update"
                  onClick={(e) => {
                    update(e);
                  }}
                />
              </div>
            </form>
          </div>
          <h3>Products in the category</h3>
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
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {Category.products.map((Product) => {
                  const discount = Math.round(
                    Product.price -
                      (Product.price * Product.discountPercentage) / 100
                  );
                  const Low = Product.stock < 5 ? "LowStock" : "";
                  return (
                    <tr key={Product.id}>
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
                      <td className={Low}>{Product.stock}</td>
                      <td>
                        <button
                          onClick={() => {
                            window.location.replace(
                              `/Dashboard/product/${Product.id}`
                            );
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
