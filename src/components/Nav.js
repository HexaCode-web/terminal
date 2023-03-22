import React, { useState } from "react";
import logo from "../assets/logo2.png";
import Logout from "../assets/logout.png";
import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
} from "firebase/firestore";
import DB from "../DBConfig.json";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";

const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
export default function Nav(props) {
  const [showSearch, setShowSearch] = useState(false);
  const ClearActive = async () => {
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
    });
    cleanData.forEach((User) => {
      if (User.Username === props.activeUser.Username) {
        User.Active = false;
      }
      setDoc(doc(db, "users", User.id.toString()), {
        ...User,
      });
    });
  };
  const logOut = async () => {
    await ClearActive();
    secureLocalStorage.clear();
    setTimeout(() => {
      window.location.replace("/");
    }, 500);
  };

  return (
    <>
      <div className="Nav">
        <div className="nav animate__animated animate__fadeInDown">
          <a href="/">
            <img className="logo" src={logo}></img>
          </a>
          <div className={`search-wrapper ${showSearch ? "animate" : ""}`}>
            <input
              required
              type="text"
              className="search"
              name="search"
              onChange={props.Search}
            />
            <span className="item itemFour"></span>
          </div>
          <ul>
            {window.location.pathname === "/" ? (
              <button
                className="item itemFour"
                onClick={() => {
                  setShowSearch((prev) => !prev);
                }}
              ></button>
            ) : (
              ""
            )}
            {props.activeUser.admin ? (
              ""
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  {props.CartAmount > 0 ? (
                    <div className="CartCounter">{props.CartAmount}</div>
                  ) : (
                    ""
                  )}
                  <div
                    style={{ cursor: "pointer" }}
                    className="item"
                    id="itemOne"
                    href="#"
                    onClick={() => {
                      props.activeUser
                        ? props.setShowCart((prev) => !prev)
                        : toast.error("You Aren't Signed in!", {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                          });
                    }}
                  ></div>
                </div>
                <a className="item" id="itemTwo" href="/User"></a>
              </>
            )}
            <a className="item" id="itemThree" href="/User"></a>
            {props.activeUser && (
              <>
                {!props.activeUser.admin && (
                  <div
                    style={{ cursor: "pointer" }}
                    className="item"
                    id="itemFive"
                    onClick={() => {
                      window.location.replace("/User/Settings");
                    }}
                  ></div>
                )}
                <div
                  className="item"
                  style={{ cursor: "pointer" }}
                  onClick={logOut}
                >
                  <img src={Logout}></img>
                </div>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
