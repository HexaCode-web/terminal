import React, { useEffect } from "react";
import Profile from "./Profile";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";
import { CreateToast } from "../App";
import {
  GETDOC,
  NEWUSER,
  SETDOC,
  LOGIN,
  DELETECURRENTUSER,
  DELETEDOC,
  RESETPASSWORD,
} from "../server";
import loadingDark from "../assets/loadingDark.gif";
import "./User.css";
import MyModal from "../components/Modal";
export default function User() {
  const [user] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [IsAdmin, setIsAdmin] = React.useState(false);
  const [showSignup, setShowSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
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
    deleteUser: false,
    gender: "",
    history: [],
    pending: [],
    joinedAt: getCurrentDateFormatted(),
    Username: "",
    Password: "",
    wishlist: [],
    phone: "",
  });
  const [showModal, setShowModal] = React.useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = async () => {
    handleCloseModal();
    try {
      RESETPASSWORD(email);
      CreateToast("email has been sent", "success");
    } catch (error) {
      CreateToast(error, "error");
    }
    setEmail("");
  };
  const [loginData, setLoginData] = React.useState({
    email: "",
    Password: "",
  });
  const changeForm = () => {
    setShowSignUp((prev) => !prev);
    setLoginData({
      email: "",
      Password: "",
    });
    setNewUser((prev) => {
      return { ...prev, email: "", Password: "", Username: "" };
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
  function getCurrentDateFormatted() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = String(currentDate.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  const Signup = async (e) => {
    CreateToast("creating account...", "info");
    e.preventDefault();

    try {
      const authUser = await NEWUSER(newUser.email, newUser.Password);
      await SETDOC(
        "users",
        authUser.uid,
        { ...newUser, id: authUser.uid },
        true
      );
      CreateToast("Successfully signed up! You can now login.", "success");
      setShowSignUp(false);
    } catch (error) {
      CreateToast(error.message, "error");
      return;
    }
  };
  const signIn = async (e) => {
    e.preventDefault();
    try {
      const authUser = await LOGIN(loginData.email, loginData.Password);
      const DBuser = await GETDOC("users", authUser.uid);
      if (DBuser.deleteUser) {
        await DELETEDOC("users", authUser.uid),
          await DELETECURRENTUSER(),
          CreateToast("sorry your account have been deleted", "info");
        return;
      } else {
        await SETDOC("users", authUser.uid, { ...DBuser, Active: true });
        secureLocalStorage.setItem("activeUser", JSON.stringify({ ...DBuser }));
        window.location.reload();
      }
    } catch (error) {
      CreateToast(error.message, "error");
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
          (window.location.href = "/Dashboard")
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
          {showSignup ? (
            <form className="animate__animated animate__fadeInDown">
              <div className="formItem ">
                <label htmlFor="email">Email:</label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={() => {
                    UpdateInput("newUser", event);
                  }}
                ></input>
              </div>
              <div className="formItem ">
                <label htmlFor="username">Username:</label>
                <input
                  required
                  type="text"
                  id="username"
                  name="Username"
                  value={newUser.Username}
                  onChange={() => {
                    UpdateInput("newUser", event);
                  }}
                ></input>
              </div>
              <div className="formItem ">
                <label htmlFor="Password">Password:</label>
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
              </div>
              <input type="submit" value="sign up" onClick={Signup}></input>
            </form>
          ) : (
            <form className="animate__animated animate__fadeInDown">
              <div className="formItem ">
                <label htmlFor="email">Email:</label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={() => {
                    UpdateInput("login", event);
                  }}
                ></input>
              </div>
              <div className="formItem " style={{ animationDelay: ".7s" }}>
                <label htmlFor="Password">Password:</label>
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
              </div>
              <input type="submit" value="login" onClick={signIn}></input>
            </form>
          )}
          <p
            className="animate__animated animate__fadeInUp"
            style={{
              textAlign: "center",
              animationDelay: "1s",
              marginTop: "15px",
            }}
          >
            {!showSignup ? "not a user?" : "already have an account?"}{" "}
            <span style={{ cursor: "pointer" }} onClick={changeForm}>
              {!showSignup ? "sign up now" : "sign in now!"}
            </span>
          </p>
          <button
            style={{
              border: "none",
              animationDelay: "1.1s",
              opacity: ".7",
              fontSize: ".8rem",
            }}
            className="animate__animated animate__fadeInUp"
            onClick={handleShowModal}
          >
            Forgot Password?
          </button>
          <MyModal
            show={showModal}
            handleClose={handleCloseModal}
            title="Reset password"
            primaryButtonText="send email"
            handlePrimaryAction={handlePrimaryAction}
          >
            <>
              <p>
                please put your email and if its a valid email we will send a
                reset password link to it
              </p>
              <div className="formItem ">
                <label htmlFor="email">Email:</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                ></input>
              </div>
            </>
          </MyModal>
        </div>
      )}
    </>
  );
}
