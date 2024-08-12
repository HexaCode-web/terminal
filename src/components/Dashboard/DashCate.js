import React, { useEffect } from "react";
import loadingLight from "../../assets//loading-13.gif";
import sortBy from "sort-by";
import MyModal from "../Modal/Modal";
import {
  GETDOC,
  SETDOC,
  DELETEDOC,
  GETCOLLECTION,
  productDistributor,
  UPLOADPHOTO,
  DELETEPHOTO,
} from "../../server";
import DataTable from "react-data-table-component";
import "./DashCate.css";
import EditCate from "./EditCate";
export default function DashCate(props) {
  const [id, setId] = React.useState();
  const [categories, setCatagories] = React.useState(props.catagories);
  const [newCate, setNewCate] = React.useState({
    Name: "",
    URL: "",
    Color: "rgba(0, 0, 0, 1)",
  });
  const [status, setStatus] = React.useState(false);
  const [urlDone, setUrlDone] = React.useState("false");
  const [showModal, setShowModal] = React.useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewCate({ Name: "", URL: "", Color: "" });
    setStatus(false);
  };
  const handlePrimaryAction = async (e) => {
    addCate();
    handleCloseModal();
  };

  const handleInput = (event) => {
    let { name, value } = event.target;
    if (name === "icon") {
      setUrlDone("pending");
      UPLOADPHOTO(`images/icons/${newCate.Name}`, event.target.files[0]).then(
        (url) => {
          setNewCate((prev) => {
            return { ...prev, URL: url };
          });
          setUrlDone("true");
        }
      );
    }
    if (name === "Color") {
      setNewCate((prev) => {
        return {
          ...prev,
          [name]: hexToRgb(value),
        };
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

  useEffect(() => {
    const fetchCata = async () => {
      setCatagories(await GETCOLLECTION("categories"));
    };
    fetchCata();
  }, []);
  const addCate = async () => {
    let id;
    let cleanData = [];
    await GETCOLLECTION("categories").then((response) => {
      cleanData = response;
    });
    cleanData.sort(sortBy("id"));
    cleanData.forEach((category) => {
      id = +category.id + 1;
    });
    if (
      cleanData.find((category) => {
        return category.Name === newCate.Name;
      })
    ) {
      alert("name already exists");
      return;
    } else {
      console.log(id);
      await SETDOC(
        "categories",
        id,
        {
          id: id ? id : 1,
          Name: newCate.Name,
          products: [],
          icon: newCate.URL,
          color: newCate.Color,
        },
        true
      );
      setCatagories(await GETCOLLECTION("categories"));
      const productList = await GETCOLLECTION("products");
      const catagories = await GETCOLLECTION("categories");
      productDistributor(productList, catagories);
      setNewCate({ Name: "", URL: "", Color: "" });
    }
  };
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(
          result[2],
          16
        )}, ${parseInt(result[3], 16)}, .7)`
      : null;
  }
  const deleteCate = async (name, id) => {
    let target;
    await GETDOC("categories", id).then((value) => {
      target = value;
    });
    if (target.products.length !== 0) {
      alert(
        "there are some products in this category,please remove them before trying to delete it"
      );
      return;
    } else {
      if (confirm("are you sure you want to delete this category?")) {
        await DELETEDOC("categories", id);
        await DELETEPHOTO(`images/icons/${name}`);
        setCatagories(await GETCOLLECTION("categories"));
      } else {
        return;
      }
    }
  };
  React.useEffect(() => {
    switch (urlDone) {
      case "false":
        setStatus(<p className="alert">Please Upload an icon</p>);
        break;
      case "true":
        setStatus("true");
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
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: "Photo",
      selector: (row) => row.photo,
      center: true,
    },
    {
      name: "Color",
      selector: (row) => row.color,
      center: true,
    },
    {
      name: "Options",
      selector: (row) => row.options,
      sortable: true,
      center: true,
    },
  ];
  const data = categories.map((category) => {
    return {
      name: category.Name,
      photo: (
        <img
          style={{ maxWidth: "200px", margin: "10px", borderRadius: "15px" }}
          src={category.icon}
        ></img>
      ),
      color: (
        <div
          style={{
            backgroundColor: category.color,
            width: "60px",
            border: "1px solid black",
            height: "60px",
            margin: "auto",
            borderRadius: "5px",
          }}
        ></div>
      ),
      options: (
        <>
          <button
            className=" button Danger large"
            onClick={() => {
              deleteCate(category.Name, category.id);
            }}
          >
            Delete
          </button>
          <button
            className="button large"
            onClick={() => {
              setId(category.id);
            }}
          >
            View & Edit
          </button>
        </>
      ),
    };
  });
  return (
    <>
      <h1 className="animate__animated animate__backInDown">Categories</h1>
      {id ? (
        <>
          <EditCate CateID={id} />
        </>
      ) : (
        <div className="Categories">
          <button
            style={{ animationDelay: ".4s" }}
            type="button"
            onClick={() => handleShowModal()}
            class="btn Modal animate__animated animate__backInUp"
          >
            Add Category
          </button>
          <MyModal
            show={showModal}
            handleClose={handleCloseModal}
            title="Add category"
            primaryButtonText={status === "true" ? "Add" : ""}
            handlePrimaryAction={handlePrimaryAction}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="modal-header"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <h2 style={{ color: "black" }} className="modal-title fs-5">
                  Add a new category
                </h2>
              </div>
              <div class="modal-body">
                <form className="AddCate">
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
                  <div className="formItem">
                    <label for="Color">Color of category:</label>
                    <input
                      style={{ border: "none" }}
                      type="color"
                      id="Color"
                      name="Color"
                      onChange={handleInput}
                    ></input>
                  </div>
                </form>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {status !== "true" ? status : ""}
                </div>
              </div>
            </div>
          </MyModal>
          <DataTable
            pagination
            highlightOnHover
            theme={localStorage.getItem("darkMode") ? "Light" : "dark"}
            columns={columns}
            data={data}
          />
        </div>
      )}
    </>
  );
}
