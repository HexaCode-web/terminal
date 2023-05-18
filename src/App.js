import React, { useEffect } from "react";
import "./index.css";
import "animate.css";
import Nav from "./components/Nav";
import Header from "./components/Header";
import Content from "./components/Content";
import SearchResult from "./components/SearchResult";
import ProductList from "./components/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import User from "./pages/User";
import History from "./pages/History";
import Pending from "./pages/Pending";
import Settings from "./pages/UserSettings";
import ViewUser from "./components/Dashboard/ViewUser";
import loadingDark from "./assets/loadingDark.gif";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import EditProduct from "./components/Dashboard/EditProduct";
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
  const [Loading, setLoading] = React.useState(false);
  const [activeUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [Data, SetData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [catagories, setCatagories] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [UpdateCart, setUpdateCart] = React.useState(0);
  const [WebsiteData, setWebsiteData] = React.useState({
    title: "",
  });

  async function GetData() {
    setLoading(true);
    await GETDOC("websiteData", "title").then((res) =>
      setWebsiteData((prev) => {
        return { ...prev, title: res.title };
      })
    );
    await GETCOLLECTION("categories").then((res) => {
      setCatagories(res);
    });
    await GETCOLLECTION("products").then((res) => SetData(res));
    setLoading(false);
  }
  const UpdateUser = async (
    targetUser,

    popups
  ) => {
    try {
      await SETDOC("users", targetUser.id, { ...targetUser });
      secureLocalStorage.setItem("activeUser", JSON.stringify(targetUser));
      popups
        ? CreateToast("your changes have been saved", "success", 3000)
        : "";
    } catch (error) {
      console.log(error);
      popups ? CreateToast("something went wrong", "error", 3000) : "";
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
    document.title = WebsiteData.title;
  }, [WebsiteData]);
  useEffect(() => {
    GetData();
  }, []);
  useEffect(() => {
    if (UpdateCart === 0) {
      GETDOC("users", activeUser.id).then((res) =>
        setUpdateCart(res.CartCount)
      );
    }
  }, [UpdateCart]);
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
      {Loading ? (
        <div className="overlay LoadingMain">
          <img src={loadingDark} />
        </div>
      ) : (
        ""
      )}
      <Nav
        handleSearch={handleSearch}
        activeUser={activeUser}
        UpdateCart={UpdateCart}
      />

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
                  <Content />
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
              UpdateCart={UpdateCart}
              setUpdateCart={setUpdateCart}
            />
          }
        ></Route>
        <Route
          path="/Cart"
          element={
            <Cart
              activeUser={activeUser}
              setActiveUser={setActiveUser}
              setUpdateCart={setUpdateCart}
            />
          }
        ></Route>
        <Route
          path="/Dashboard"
          element={<DashBoard Data={Data} UpdateUser={UpdateUser} />}
        ></Route>
        <Route path="/Dashboard/product/:ID" element={<EditProduct />}></Route>
        <Route
          path="/Dashboard/User/:ID"
          element={<ViewUser activeUser={activeUser} />}
        ></Route>
        <Route path="User" element={<User />}></Route>
        <Route path="User/Pending" element={<Pending />}></Route>
        <Route path="User/History" element={<History />}></Route>
        <Route
          path="User/Settings"
          element={<Settings UpdateUser={UpdateUser} />}
        ></Route>
      </Routes>
      <Footer
        catagories={catagories}
        activeUser={activeUser}
        webName={WebsiteData.title}
      />
    </div>
  );
}
