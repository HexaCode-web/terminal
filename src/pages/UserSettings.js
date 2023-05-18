import React, { useEffect } from "react";
import MyModal from "../components/Modal";
import secureLocalStorage from "react-secure-storage";
import "react-toastify/dist/ReactToastify.css";
import { CreateToast } from "../App";
import _ from "lodash";

import {
  DELETEDOC,
  GETCOLLECTION,
  GETDOC,
  UPDATEEMAIL,
  SETDOC,
  LOGIN,
  RESETPASSWORD,
} from "../server";
export default function Settings(props) {
  const [activePage, setActivePage] = React.useState("Login");
  const [showModal, setShowModal] = React.useState(false);
  const [loginData, setLoginData] = React.useState({
    email: "",
    Password: "",
  });
  const [ActiveUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  let OldEmail = JSON.parse(secureLocalStorage.getItem("activeUser")).email;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setActiveUser((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const SaveData = async (e) => {
    let userToSend;
    e.preventDefault();
    const usersList = await GETCOLLECTION("users");
    const Match = usersList.find((user) => {
      return user.email === ActiveUser.email;
    });
    if (Match) {
      userToSend = { ...ActiveUser, email: OldEmail };
      CreateToast("email wasn't updated due to it was  taken", "error");
    } else {
      userToSend = ActiveUser;
      try {
        await UPDATEEMAIL(ActiveUser.email);
        CreateToast("Data updated", "success");
      } catch (error) {
        CreateToast(error.message, "error");
      }
    }
    props.UpdateUser(userToSend, false);
    OldEmail = JSON.parse(secureLocalStorage.getItem("activeUser")).email;
  };
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = async (e) => {
    await DELETEDOC("users", ActiveUser.id);
    setShowModal(false);
    secureLocalStorage.clear();
    setTimeout(() => {
      window.location.href = "/User";
    }, 500);
  };
  useEffect(() => {
    const FetchUser = async () => {
      GETDOC("users", ActiveUser.id).then((res) => setActiveUser(res));
    };
    FetchUser();
  }, []);
  const SendResetEmail = async () => {
    try {
      RESETPASSWORD(ActiveUser.email);
      CreateToast("email has been sent", "success");
    } catch (error) {
      CreateToast(error, "error");
    }
  };
  const signIn = async (e) => {
    e.preventDefault();
    if (loginData.email === ActiveUser.email) {
      try {
        const authUser = await LOGIN(loginData.email, loginData.Password);
        const DBuser = await GETDOC("users", authUser.uid);
        await SETDOC("users", authUser.uid, { ...DBuser, Active: true });
        secureLocalStorage.setItem("activeUser", JSON.stringify({ ...DBuser }));
        setActivePage("General");
      } catch (error) {
        CreateToast(error.message, "error");
      }
    } else {
      CreateToast("email doesn't match the signed in one", "error");
    }
  };
  const UpdateInput = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <>
      {activePage === "Login" ? (
        <div className="Container">
          <h3> please login once more </h3>
          <form className="animate__animated animate__fadeInDown">
            <div className="formItem ">
              <label htmlFor="email">Email:</label>
              <input
                required
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={UpdateInput}
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
                onChange={UpdateInput}
              ></input>
            </div>
            <input type="submit" value="login" onClick={signIn}></input>
          </form>
        </div>
      ) : (
        <div className="Dashboard">
          <div className="SideBar">
            <ul className="BTNList">
              <li>
                <h3
                  onClick={() => setActivePage("General")}
                  className={activePage === "General" ? "ActiveLink" : ""}
                >
                  General Info
                </h3>
              </li>
              <li>
                <h3
                  onClick={() => setActivePage("Privacy")}
                  className={activePage === "Privacy" ? "ActiveLink" : ""}
                >
                  Privacy
                </h3>
              </li>
            </ul>
          </div>
          <div className="Main">
            {activePage === "General" ? (
              <div className="General">
                <h1>General info</h1>
                <form>
                  <div id="Fname">
                    <label htmlFor="first-name">First Name:</label>
                    <input
                      type="text"
                      id="first-name"
                      name="Fname"
                      value={ActiveUser.Fname}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Lname">
                    <label htmlFor="last-name">Last Name:</label>
                    <input
                      type="text"
                      id="last-name"
                      name="Lname"
                      value={ActiveUser.Lname}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Username">
                    <label htmlFor="username">Username:</label>
                    <input
                      type="text"
                      id="username"
                      name="Username"
                      value={ActiveUser.Username}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Phone">
                    <label htmlFor="phone">Phone Number:</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={ActiveUser.phone}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Email">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={ActiveUser.email}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Address">
                    <label htmlFor="address">Address:</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={ActiveUser.address}
                      onChange={handleInput}
                    />
                  </div>
                  <div id="Gender">
                    <label htmlFor="gender">Gender:</label>
                    <select
                      id="gender"
                      name="gender"
                      defaultValue={ActiveUser.gender}
                      onChange={handleInput}
                    >
                      <option value="" disabled>
                        Select your gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div id="DOB">
                    <label htmlFor="birthdate">Date of Birth:</label>
                    <input
                      type="date"
                      id="birthdate"
                      name="dateOfBirth"
                      value={ActiveUser.dateOfBirth}
                      onChange={handleInput}
                    />
                  </div>
                  <input
                    id="Save"
                    type="submit"
                    onClick={(e) => {
                      SaveData(e);
                    }}
                    value="Save"
                    style={{ margin: "auto", width: "50%" }}
                  />
                </form>
              </div>
            ) : (
              ""
            )}
            {activePage === "Privacy" ? (
              <div className="Privacy">
                <div className="Button-Wrapper">
                  <button className="btn btn-primary" onClick={SendResetEmail}>
                    Change Password
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleShowModal}
                    style={{ margin: "auto" }}
                  >
                    delete Account
                  </button>
                  <MyModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    title="Delete Account"
                    primaryButtonText="Delete my account"
                    handlePrimaryAction={handlePrimaryAction}
                  >
                    <>
                      <p style={{ textAlign: "center" }}>
                        are you sure you want to delete your account? this
                        action is IRREVERSIBLE
                      </p>
                    </>
                  </MyModal>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      )}
      {props.UserUpdated && CreateToast("Updated your info!", "success")}
    </>
  );
}
