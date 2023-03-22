import React, { useEffect } from "react";
import "./index.css";
import "animate.css";
import Nav from "./components/Nav";
import Header from "./pages/Header";
import Content from "./pages/Content";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./components/Cart";
import User from "./pages/User";
import Settings from "./pages/UserSettings";
import { Routes, Route } from "react-router-dom";
import DB from "./DBConfig.json";
import { initializeApp } from "firebase/app";
import {
  doc,
  deleteDoc,
  getFirestore,
  setDoc,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";
import secureLocalStorage from "react-secure-storage";

import EditProduct from "./pages/EditProduct";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const app = initializeApp(DB.firebaseConfig);

const db = getFirestore(app);

export default function App() {
  const [UserUpdated, setUserUpdated] = React.useState(false);
  const [activeUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [showCart, setShowCart] = React.useState(false);
  const [Data, SetData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [catagories, setCatagories] = React.useState({});
  const [cataIcons, setCataIcons] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState(null);
  const [CartAmount, setCartAmount] = React.useState(0);
  const getProduct = async (id) => {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return "Error";
    }
  };
  const UpdateProduct = async (id, Product) => {
    await setDoc(doc(db, "products", id.toString()), {
      ...Product,
    });
  };
  async function GetData() {
    await getDoc(doc(db, "statistics", "1")).then((res) => {
      setCatagories(res.data().catagories);
    });
    await getDoc(doc(db, "statistics", "2")).then((res) =>
      setCataIcons(res.data().categoriesIcons)
    );
    const srcData = await getDocs(collection(db, "products"));
    const updatedList = [];
    srcData.forEach((doc) => {
      const info = doc.data();
      updatedList.push(info);
    });
    SetData(updatedList);
    productDistributor(Data, catagories);
  }

  async function GetUser(id) {
    const docRef = doc(db, "users", id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return "error";
    }
  }
  const UpdateUser = async (targetUser = "", ChangePass, Password = "") => {
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
    });
    cleanData.some((user, index) => {
      if (!ChangePass) {
        if (user.Username === activeUser.Username) {
          secureLocalStorage.setItem("activeUser", JSON.stringify(targetUser));
          setTimeout(() => {
            setDoc(doc(db, "users", (index + 1).toString()), {
              ...targetUser,
              Password: user.Password,
            });
          }, 500);
        }
      } else {
        if (user.Username === activeUser.Username) {
          secureLocalStorage.setItem(
            "activeUser",
            JSON.stringify({ ...user, Password: Password })
          );
          setTimeout(() => {
            setDoc(doc(db, "users", (index + 1).toString()), {
              ...user,
              Password: Password,
            });
          }, 500);
        }
      }
    });
    setUserUpdated(true);
    setTimeout(() => {
      setUserUpdated(false);
    }, 500);
  };
  const Search = (event) => {
    setSearchTerm(event.target.value);
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
  function productDistributor(productList = [], CategoryContainer = {}) {
    for (let index = 0; index < productList.length; index++) {
      Object.keys(CategoryContainer).forEach((key) => {
        if (productList[index].category === key) {
          if (CategoryContainer[key].length === 0) {
            CategoryContainer[key].push(productList[index]);
          } else {
            if (
              CategoryContainer[key].find(
                (innerProduct) => innerProduct.id == productList[index].id
              )
            ) {
              return;
            } else {
              CategoryContainer[key].push(productList[index]);
            }
          }
        }
      });
    }
    return CategoryContainer;
  }
  useEffect(() => {
    productDistributor(Data, catagories);
  }, [Data]);
  const Delete = async (Doc, id) => {
    const TargetID = id.toString();
    deleteDoc(doc(db, Doc, TargetID));
  };
  useEffect(() => {
    if (Object.keys(catagories).length !== 0) {
      setDoc(doc(db, "statistics", "1"), {
        catagories,
      });
    }
  }, [catagories]);
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
        Search={Search}
        activeUser={activeUser}
        updateUser={UpdateUser}
        setShowCart={setShowCart}
        CartAmount={CartAmount}
      />
      {showCart && (
        <Cart
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          updateUser={UpdateUser}
          setCartAmount={setCartAmount}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            searchTerm ? (
              <div>
                <Header
                  List={Data}
                  catagories={catagories}
                  cataIcons={cataIcons}
                />
                <ProductList List={filteredData} />
              </div>
            ) : (
              <div>
                <Header
                  List={Data}
                  catagories={catagories}
                  cataIcons={cataIcons}
                />
                <Content List={Data} />
              </div>
            )
          }
        ></Route>
        {catagories ? (
          <Route
            path="category/:ID"
            element={
              <>
                <Header List={Data} />
                {Object.keys(catagories).length !== 0 ? (
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
              getUser={GetUser}
              updateUser={UpdateUser}
              Items={Data}
              setCartAmount={setCartAmount}
            />
          }
        ></Route>
        <Route
          path="User/product/:ID"
          element={
            <EditProduct
              getProduct={getProduct}
              UpdateProduct={UpdateProduct}
              getUser={GetUser}
            />
          }
        ></Route>
        <Route
          path="User"
          element={
            <User
              getUser={GetUser}
              activeUser={activeUser}
              Data={Data}
              UpdateUser={UpdateUser}
              UserUpdated={UserUpdated}
              Delete={Delete}
            />
          }
        ></Route>
        <Route
          path="User/Settings"
          element={
            <Settings
              UpdateUser={UpdateUser}
              UserUpdated={UserUpdated}
              Delete={Delete}
            />
          }
        ></Route>
      </Routes>
    </div>
  );
}
