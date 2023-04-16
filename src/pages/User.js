import React, { useEffect } from "react";
import Profile from "./Profile";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";
import { CreateToast } from "../App";
import { GETCOLLECTION, GETDOC, SETDOC } from "../server";
import sortBy from "sort-by";
import loadingDark from "../assets/loadingDark.gif";

export default function User() {
  const [user] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [isLoading, setIsLoading] = React.useState(true);

  const [IsAdmin, setIsAdmin] = React.useState(false);
  const [showSignup, setShowSignUp] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    Active: false,
    Lname: "",
    Fname: "",
    address: "",
    admin: false,
    CartCount: 0,
    cart: [],
    dateOfBirth: "",
    email: "",
    gender: "",
    history: [],
    joinedAt:
      new Date().getDate() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      (new Date().getYear() - 100),
    Username: "",
    Password: "",
    wishlist: [],
    phone: "",
  });
  const [loginData, setLoginData] = React.useState({
    Username: "",
    Password: "",
  });
  const changeForm = () => {
    setShowSignUp((prev) => !prev);
    setLoginData({
      Username: "",
      Password: "",
    });
    setNewUser((prev) => {
      return { ...prev, Username: "", Password: "" };
    });
  };

  const UpdateInput = (form, event) => {
    if (form === "login") {
      const { name, value } = event.target;
      setLoginData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
    if (form === "newUser") {
      const { name, value } = event.target;
      setNewUser((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };
  const Signup = async (e) => {
    e.preventDefault();
    let id;
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    cleanData.sort(sortBy("id"));
    cleanData.forEach((user) => {
      id = +user.id + 1;
    });
    if (
      cleanData.some((data) => {
        return data.Username === newUser.Username;
      })
    ) {
      CreateToast(
        "this userName is taken, please try a new UserName!",
        "error"
      );
      return;
    } else {
      SETDOC("users", id, { ...newUser, id }).catch((error) => {
        CreateToast(error, "error");
        return;
      });
      CreateToast("successfully signed up! you can now login!", "success");
      setShowSignUp(false);
    }
  };
  const signIn = async (e) => {
    e.preventDefault();
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    if (
      cleanData.some((user) => {
        return user.Username === loginData.Username;
      })
    ) {
      const tempData = cleanData.find((user) => {
        return (
          user.Username === loginData.Username &&
          user.Password === loginData.Password
        );
      });
      if (tempData) {
        tempData.Active = true;
        await SETDOC("users", tempData.id, { ...tempData });
        secureLocalStorage.setItem(
          "activeUser",
          JSON.stringify({ ...tempData })
        );
        window.location.reload();
      } else {
        CreateToast("invalid credentials, try again", "error");
      }
    } else {
      CreateToast("invalid credentials, try again", "error");
    }
  };

  GETDOC("users", user.id).then((value) => {
    value.admin ? setIsAdmin(true) : setIsAdmin(false);
    setIsLoading(false);
  });

  return (
    <>
      {user ? (
        isLoading ? (
          <img
            style={{ width: "50px", margin: "auto" }}
            src={loadingDark}
          ></img>
        ) : IsAdmin ? (
          window.location.replace("/Dashboard")
        ) : (
          !IsAdmin && <Profile />
        )
      ) : (
        <div className="Container ">
          <h3
            className="animate__animated animate__fadeInDown"
            style={{ animationDelay: ".5s" }}
          >
            {!showSignup ? "Welcome Back!" : "Register"}
          </h3>
          <form className="animate__animated animate__fadeInDown">
            <div
              className="formItem animate__animated animate__backInRight"
              style={{ animationDelay: ".7s" }}
            >
              <label htmlFor="userName">UserName:</label>
              {!showSignup /*sign in form*/ ? (
                <input
                  required
                  type="text"
                  id="userName"
                  name="Username"
                  value={loginData.Username}
                  onChange={() => {
                    UpdateInput("login", event);
                  }}
                ></input>
              ) : (
                <input
                  required
                  type="text"
                  id="userName"
                  name="Username"
                  value={newUser.Username}
                  onChange={() => {
                    UpdateInput("newUser", event);
                  }}
                ></input>
              )}
            </div>
            <div
              className="formItem animate__animated animate__backInRight"
              style={{ animationDelay: ".8s" }}
            >
              <label htmlFor="Password">Password:</label>
              {!showSignup /*sign in form*/ ? (
                <input
                  min={8}
                  required
                  type="password"
                  id="Password"
                  name="Password"
                  value={loginData.Password}
                  onChange={() => {
                    UpdateInput("login", event);
                  }}
                ></input>
              ) : (
                <input
                  required
                  type="password"
                  id="Password"
                  name="Password"
                  value={newUser.Password}
                  onChange={() => {
                    UpdateInput("newUser", event);
                  }}
                ></input>
              )}
            </div>
            {!showSignup ? (
              <input
                className=" animate__animated animate__backInDown"
                style={{ animationDelay: ".9s" }}
                type="submit"
                value="login"
                onClick={signIn}
              ></input>
            ) : (
              <input
                className=" animate__animated animate__backInDown"
                style={{ animationDelay: ".9s" }}
                type="submit"
                value="sign up"
                onClick={Signup}
              ></input>
            )}
          </form>
          <p
            className="animate__animated animate__fadeInUp"
            style={{
              textAlign: "center",
              animationDelay: "2s",
              marginTop: "15px",
            }}
          >
            {!showSignup ? "not a user?" : "already have an account?"}{" "}
            <span style={{ cursor: "pointer" }} onClick={changeForm}>
              {!showSignup ? "sign up now" : "sign in now!"}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
