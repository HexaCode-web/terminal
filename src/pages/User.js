import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
} from "firebase/firestore";
import DB from "../DBConfig.json";
import DashBoard from "./Dashboard";
import Profile from "./Profile";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";

const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
export default function User(props) {
  const [user] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );

  const [IsAdmin, setIsAdmin] = React.useState(false);
  const [showSignup, setShowSignUp] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    Active: false,
    Lname: "",
    Fname: "",
    address: "",
    admin: false,
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
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    let id;
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
      id = info.id + 1;
    });
    if (
      cleanData.some((data) => {
        return data.Username === newUser.Username;
      })
    ) {
      toast.error("this userName is taken, please try a new UserName!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else {
      setDoc(doc(db, "users", id.toString()), { ...newUser, id });
      toast.success("successfully signed up! you can now login!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  const signIn = async (e) => {
    e.preventDefault();
    const srcData = await getDocs(collection(db, "users"));
    const cleanData = [];
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
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
        await setDoc(doc(db, "users", tempData.id.toString()), {
          ...tempData,
        });
        secureLocalStorage.setItem(
          "activeUser",
          JSON.stringify({ ...tempData })
        );
        window.location.reload();
      } else {
        toast.error("invalid credentials, try again", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } else {
      toast.error("invalid credentials, try again", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  if (user) {
    useEffect(() => {
      props.getUser(user.id).then((value) => {
        value.admin ? setIsAdmin(true) : setIsAdmin(false);
      });
    }, []);
  }

  return (
    <>
      {user ? (
        IsAdmin ? (
          <DashBoard
            Data={props.Data}
            UpdateUser={props.UpdateUser}
            UserUpdated={props.UserUpdated}
            Delete={props.Delete}
          />
        ) : (
          <Profile User={user} />
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
