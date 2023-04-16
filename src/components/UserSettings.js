import React from "react";
import MyModal from "./Modal";
import secureLocalStorage from "react-secure-storage";
import "react-toastify/dist/ReactToastify.css";
import { CreateToast } from "../App";
import { DELETEDOC } from "../server";
export default function Settings(props) {
  const [activePage, setActivePage] = React.useState("General");
  const [ShowChangePassword, setShowChangePassword] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const [ActiveUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [changePass, setChangePass] = React.useState({
    oldPass: ActiveUser.Password,
    verifyPass: "",
    newPass: "",
  });
  const handleInput = (e) => {
    const { name, value } = e.target;
    setActiveUser((prev) => {
      return { ...prev, [name]: value };
    });
  };
  const handlePassInput = (e) => {
    const { name, value } = e.target;
    setChangePass((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const validatePass = () => {
    if (changePass.verifyPass === changePass.oldPass) {
      props.UpdateUser(null, true, changePass.newPass);
    } else {
      CreateToast("Old Password doesn't match your password", "error");
    }
  };
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = async (e) => {
    await DELETEDOC("users", ActiveUser.id);
    setShowModal(false);
    secureLocalStorage.clear();
    setTimeout(() => {
      window.location.replace("/User");
    }, 500);
  };

  return (
    <>
      {props.UserUpdated && CreateToast("Updated your info!", "success")}
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
                    e.preventDefault();
                    props.UpdateUser(ActiveUser, false);
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
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowChangePassword((prev) => !prev);
                  }}
                >
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
                      are you sure you want to delete your account? this action
                      is IRREVERSIBLE
                    </p>
                  </>
                </MyModal>
              </div>
              {ShowChangePassword ? (
                <form className="form-Wrapper">
                  <label htmlFor="oldPass">old Password:</label>
                  <input
                    id="oldPass"
                    name="verifyPass"
                    onChange={handlePassInput}
                  ></input>
                  <label htmlFor="oldPass">New Password:</label>
                  <input
                    id="newPass"
                    name="newPass"
                    onChange={handlePassInput}
                  ></input>
                  <input
                    id="Save"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      validatePass(e);
                    }}
                    value="Save"
                  />
                </form>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}
