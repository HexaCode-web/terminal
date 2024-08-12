import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";

import Icons from "../HandleIconChange";
import HoverProfile from "../../assets/login-hover.png";
import NormalProfile from "../../assets/login.png";
import DarkProfile from "../../assets/login dark.png";
import HoverCart from "../../assets/cart-hover.png";
import NormalCart from "../../assets/cart.png";
import DarkCart from "../../assets/cart dark.png";
import HoverWish from "../../assets/heart-hover.png";
import NormalWish from "../../assets/heart.png";
import darkWish from "../../assets/heart dark.png";
import HoverSettings from "../../assets/settings-hover.png";
import HoverSearch from "../../assets/search-hover.png";
import NormalSettings from "../../assets/settings.png";
import DarkSettings from "../../assets/settings dark.png";

import darkSearch from "../../assets/search dark.png";
import NormalSearch from "../../assets/search.png";
import HoverLogout from "../../assets/logout-hover.png";
import NormalLogout from "../../assets/logout.png";
import DarkLogout from "../../assets/logout Dark.png";
import HoverDashboard from "../../assets/dashboard-hover.png";
import NormalDashboard from "../../assets/dashboard.png";
import DarkDashboard from "../../assets/dashboard dark.png";
import "./Nav.css";
import { GETCOLLECTION, GETDOC, SETDOC } from "../../server";
import Light from "../../assets/lightmode.png";
import Dark from "../../assets/dark-mode.png";
export default function Nav(props) {
  const [ShowDropDown, setShowDropDown] = React.useState(false);
  const [CartCount, setCartCount] = React.useState();
  const [Color, setColor] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const ChangeColor = () => {
    if (width < 500) {
      if (window.scrollY >= 10) {
        setColor(true);
      } else {
        setColor(false);
      }
    } else {
      if (window.scrollY >= 50) {
        setColor(true);
      } else {
        setColor(false);
      }
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", () => {
      ChangeColor();
    });
  }, []);
  const [logo, setLogo] = React.useState("");
  useEffect(() => {
    const UpdateNumber = async () => {
      await GETDOC("users", props.activeUser.id).then((res) =>
        setCartCount(res.CartCount)
      );
    };
    UpdateNumber();
  }, [props.UpdateCart]);
  const [showSearch, setShowSearch] = useState(false);
  const logOut = async () => {
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    cleanData.forEach(async (User) => {
      if (User.Username === props.activeUser.Username) {
        User.Active = false;
      }
      await SETDOC("users", User.id, { ...User });
      secureLocalStorage.clear();
      window.location.href = "/";
    });
  };

  useEffect(() => {
    if (!props.activeUser.admin) {
      document.getElementById("itemThree").addEventListener("click", () => {
        if (props.activeUser) {
          setShowDropDown((prev) => !prev);
        } else {
          window.location.href = "/User";
        }
      });
    } else {
      return;
    }
  }, []);
  useEffect(() => {
    const GetLogo = async () => {
      const logo = await GETDOC("websiteData", "icon");
      setLogo(logo.icon);
    };
    GetLogo();
  }, []);
  return (
    <>
      <div className={`Nav  animate__fadeInDown ${Color ? "Nav-bg" : ""}`}>
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
              <Icons
                className="item"
                defaultSrc={
                  JSON.parse(localStorage.getItem("darkMode"))
                    ? darkSearch
                    : NormalSearch
                }
                hoverSrc={HoverSearch}
                onClick={() => {
                  setShowSearch((prev) => !prev);
                }}
              />
            ) : (
              ""
            )}
            <div className="dropDown-wrapper">
              {props.activeUser.admin ? (
                <Icons
                  className="item"
                  defaultSrc={
                    JSON.parse(localStorage.getItem("darkMode"))
                      ? DarkDashboard
                      : NormalDashboard
                  }
                  hoverSrc={HoverDashboard}
                  onClick={() => {
                    window.location.href = "/Dashboard";
                  }}
                />
              ) : (
                <img
                  className="item"
                  id="itemThree"
                  src={
                    ShowDropDown
                      ? HoverProfile
                      : JSON.parse(localStorage.getItem("darkMode"))
                      ? DarkProfile
                      : NormalProfile
                  }
                ></img>
              )}

              {ShowDropDown && (
                <div className="DropDown">
                  <div style={{ position: "relative" }}>
                    {CartCount > 0 ? (
                      <div className="CartCounter">{CartCount}</div>
                    ) : (
                      ""
                    )}
                    <Icons
                      className="item"
                      defaultSrc={
                        JSON.parse(localStorage.getItem("darkMode"))
                          ? DarkCart
                          : NormalCart
                      }
                      hoverSrc={HoverCart}
                      onClick={() => {
                        window.location.href = "/Cart";
                      }}
                    />
                  </div>
                  <Icons
                    className="item"
                    defaultSrc={
                      JSON.parse(localStorage.getItem("darkMode"))
                        ? darkWish
                        : NormalWish
                    }
                    hoverSrc={HoverWish}
                    onClick={() => {
                      window.location.href = "/User";
                    }}
                  />
                  <Icons
                    className="item"
                    defaultSrc={
                      JSON.parse(localStorage.getItem("darkMode"))
                        ? DarkSettings
                        : NormalSettings
                    }
                    hoverSrc={HoverSettings}
                    onClick={() => {
                      window.location.href = "/User/Settings";
                    }}
                  />
                </div>
              )}
            </div>
            <img
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
              src={props.darkMode ? Dark : Light}
              onClick={props.toggleDarkMode}
            ></img>
            {props.activeUser && (
              <>
                <Icons
                  className="item"
                  defaultSrc={
                    JSON.parse(localStorage.getItem("darkMode"))
                      ? DarkLogout
                      : NormalLogout
                  }
                  hoverSrc={HoverLogout}
                  onClick={() => {
                    logOut();
                  }}
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
