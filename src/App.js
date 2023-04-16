import React, { useEffect } from "react";
import "./index.css";
import "animate.css";
import Nav from "./components/Nav";
import Header from "./components/Header";
import Content from "./components/Content";
import SearchResult from "./components/SearchResult";
import ProductList from "./components/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./components/Cart";
import User from "./pages/User";
import Settings from "./components/UserSettings";
import { Routes, Route } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import EditProduct from "./pages/EditProduct";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GETCOLLECTION, GETDOC, SETDOC } from "./server";
import DashBoard from "./pages/Dashboard";
export const CreateToast = (text, type, duration = 5000) => {
  let value;
  switch (type) {
    case "success":
      value = toast.success;
      break;
    case "info":
      value = toast.info;
      break;
    case "warning":
      value = toast.warning;
      break;
    case "error":
      value = toast.error;
      break;
    default:
      value = toast;
      break;
  }
  return value(text, {
    position: "bottom-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};
export default function App() {
  const [activeUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [showCart, setShowCart] = React.useState(false);
  const [Data, SetData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [catagories, setCatagories] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [UpdateCart, setUpdateCart] = React.useState(0);
  async function GetData() {
    await GETCOLLECTION("categories").then((res) => {
      setCatagories(res);
    });
    await GETCOLLECTION("products").then((res) => SetData(res));
  }

  const UpdateUser = async (targetUser, ChangePass, NewPassword = " ") => {
    CreateToast("updating", "info", 1000);
    if (!ChangePass) {
      try {
        await SETDOC("users", targetUser.id, { ...targetUser });
        secureLocalStorage.setItem("activeUser", JSON.stringify(targetUser));
        CreateToast("your changes have been saved", "success", 3000);
      } catch (error) {
        CreateToast("something went wrong", "error", 3000);
      }
    } else {
      try {
        await SETDOC("users", targetUser.id, {
          ...targetUser,
          Password: NewPassword,
        });
        secureLocalStorage.setItem(
          "activeUser",
          JSON.stringify({ targetUser, Password: NewPassword })
        );
        CreateToast("your changes have been saved", "success");
      } catch (error) {
        CreateToast("something went wrong", "error");
      }
    }
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    Search();
  };

  const Search = () => {
    setFilteredData(
      Data.filter((product) => {
        if (searchTerm === "") {
          return product;
        } else if (
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return product;
        }
      })
    );
  };
  useEffect(() => {
    GetData();
  }, []);

  return (
    <div className="App">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Nav
        handleSearch={handleSearch}
        activeUser={activeUser}
        setShowCart={setShowCart}
        UpdateCart={UpdateCart}
      />
      {showCart && (
        <Cart
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          updateUser={UpdateUser}
          setUpdateCart={setUpdateCart}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <>
              {searchTerm ? (
                <div>
                  <SearchResult List={filteredData} />
                </div>
              ) : (
                <div>
                  <Header List={Data} catagories={catagories} />
                  <Content List={Data} />
                </div>
              )}
            </>
          }
        ></Route>
        {catagories ? (
          <Route
            path="category/:ID"
            element={
              <>
                <Header List={Data} catagories={catagories} />
                {catagories.length !== 0 ? (
                  <ProductList List={catagories} />
                ) : (
                  ""
                )}
              </>
            }
          ></Route>
        ) : (
          ""
        )}
        <Route
          path="product/:ID"
          element={
            <ProductDetails
              updateUser={UpdateUser}
              Items={Data}
              setShowCart={setShowCart}
              UpdateCart={UpdateCart}
              setUpdateCart={setUpdateCart}
            />
          }
        ></Route>
        <Route
          path="/Dashboard"
          element={<DashBoard Data={Data} UpdateUser={UpdateUser} />}
        ></Route>
        <Route path="/Dashboard/product/:ID" element={<EditProduct />}></Route>
        <Route path="User" element={<User />}></Route>
        <Route
          path="User/Settings"
          element={<Settings UpdateUser={UpdateUser} />}
        ></Route>
      </Routes>
    </div>
  );
}
