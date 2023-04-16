import React, { useEffect, useState } from "react";
import logo from "../assets/logo2.png";
import Logout from "../assets/logout.png";
import secureLocalStorage from "react-secure-storage";
import { CreateToast } from "../App";
import { GETCOLLECTION, GETDOC, SETDOC } from "../server";
export default function Nav(props) {
  const [CartCount, setCartCount] = React.useState();
  useEffect(() => {
    GETDOC("users", props.activeUser.id).then((user) =>
      setCartCount(user.CartCount)
    );
  }, [props.UpdateCart]);
  const [showSearch, setShowSearch] = useState(false);
  const ClearActive = async () => {
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    cleanData.forEach((User) => {
      if (User.Username === props.activeUser.Username) {
        User.Active = false;
      }
      SETDOC("users", User.id, { ...User });
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
              onChange={() => {
                props.handleSearch(event);
              }}
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
                  {CartCount > 0 ? (
                    <div className="CartCounter">{CartCount}</div>
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
                        : CreateToast("You Aren't Signed in!", "error");
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
