/* DATABASE end*/
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import DB from "../DBConfig.json";
import React, { useEffect } from "react";
import loadingDark from "../assets/loadingDark.gif";
import deleteIcon from "../assets/delete.png";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import Users from "../components/DashUsers";
import Products from "../components/DashProducts";
import "react-toastify/dist/ReactToastify.css";
import MyModal from "../components/Modal";
import secureLocalStorage from "react-secure-storage";
import DashCate from "../components/DashCate";
import { CreateToast } from "../App";
import {
  DELETEDOC,
  GETCOLLECTION,
  GETDOC,
  SETDOC,
  productDistributor,
} from "../server";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashBoard(props) {
  const [ActiveUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [statistics, setStatistics] = React.useState({});
  const [greeting, setGreeting] = React.useState("");
  const [activeUsers, setActiveUsers] = React.useState(0);
  const [UserList, setUserList] = React.useState([]);
  const [catagories, setCatagories] = React.useState([]);
  const [productList, setProductList] = React.useState([]);
  const [activePage, setActivePage] = React.useState("Dashboard");
  const [chartData, setChartData] = React.useState();
  const [Notes, setNotes] = React.useState([]);
  const [ShowChangePassword, setShowChangePassword] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [changePass, setChangePass] = React.useState({
    oldPass: ActiveUser.Password,
    verifyPass: "",
    newPass: "",
  });

  /*PERSONAL ADMIN INFO*/
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
      props.UpdateUser(ActiveUser, true, changePass.newPass);
    } else {
      CreateToast("Old Password doesn't match your password", "error");
    }
  };
  /*PERSONAL ADMIN INFO*/

  /*USERS  SETTINGS*/
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
  /* END USERS  SETTINGS*/
  /*GETTING NUMBERS*/
  const fetchNumbers = async () => {
    let cleanUserList = [];
    let catagoriesLocal = {};
    await GETCOLLECTION("users").then((response) => {
      cleanUserList = response;
    });
    await GETCOLLECTION("categories").then((res) => {
      setCatagories(res);
      catagoriesLocal = res;
    });

    setUserList(cleanUserList);
    let cleanProductsData = [];
    await GETCOLLECTION("products").then((response) => {
      cleanProductsData = response;
    });
    setProductList(cleanProductsData);
    const getChartData = () => {
      let LengthAr = [];
      let NameAR = [];
      let ColorAr = [];
      catagoriesLocal.forEach((category) => {
        LengthAr.push(category.products.length);
        NameAR.push(category.Name);
        ColorAr.push(category.color);
      });
      return { LengthAr, NameAR, ColorAr };
    };
    setChartData({
      labels: getChartData().NameAR,
      datasets: [
        {
          label: "Number of products",
          data: getChartData().LengthAr,
          backgroundColor: getChartData().ColorAr,
          borderColor: ["#ee233a"],
        },
      ],
    });
    GETDOC("statistics", 0).then((value) => {
      setStatistics(value);
      setNotes(value.notes);
    });
  };
  const CountUsers = async () => {
    setActiveUsers(0);
    await GETCOLLECTION("users").then((response) => {
      response.forEach((user) => {
        if (user.Active) {
          setActiveUsers((prev) => prev + 1);
        }
      });
    });
  };
  const ChangeStatues = async () => {
    let cleanData = [];
    await GETCOLLECTION("users").then((response) => {
      cleanData = response;
    });
    cleanData.forEach((User) => {
      if (User.Username === ActiveUser.Username) {
        User.Active = true;
      }
      SETDOC("users", User.id, { ...User });
    });
  };
  const AddNote = async () => {
    const tempData = {
      ...statistics,
      notes: [
        {
          Text: document.querySelector("#NoteValue").value,
          Maker: ActiveUser.Username,
        },
        ...Notes,
      ],
    };
    await SETDOC("statistics", 0, { ...tempData });
    await GETDOC("statistics", 0).then((res) => {
      setNotes(res.notes);
    });
  };
  const DeleteNote = async (index) => {
    const tempNote = Notes;
    tempNote.splice(index, 1);
    setNotes(tempNote);
    const tempData = {
      ...statistics,
      notes: tempNote,
    };
    await SETDOC("statistics", 0, { ...tempData });
    await GETDOC("statistics", 0).then((res) => {
      setNotes(res.notes);
    });
  };
  const distribute = async () => {
    const productList = await GETCOLLECTION("products");
    const catagories = await GETCOLLECTION("categories");
    productDistributor(productList, catagories);
  };
  /*END GETTING NUMBERS*/
  useEffect(() => {
    fetchNumbers();
    ChangeStatues();
    CountUsers();
    distribute();
    if (new Date().getHours() < 12) setGreeting("Good morning");
    else if (new Date().getHours() < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  useEffect(() => {
    if (!(Object.keys(statistics).length === 0)) {
      SETDOC("statistics", 0, { ...statistics, UserCount: UserList.length });
    }
  }, [statistics]);
  return (
    <div className="Dashboard">
      {props.UserUpdated && CreateToast("Updated your info!", "success")}
      <div className="SideBar">
        <h3 className="Greet">
          {greeting} <br />
          <br /> {ActiveUser.Username}
        </h3>
        <ul className="BTNList">
          <li>
            <h3
              onClick={() => setActivePage("Dashboard")}
              className={activePage === "Dashboard" ? "ActiveLink" : ""}
            >
              DashBoard
            </h3>
          </li>
          <li>
            <h3
              onClick={() => setActivePage("Users")}
              className={activePage === "Users" ? "ActiveLink" : ""}
            >
              Users
            </h3>
          </li>
          <li>
            <h3
              onClick={() => setActivePage("Products")}
              className={activePage === "Products" ? "ActiveLink" : ""}
            >
              Products
            </h3>
          </li>
          <li>
            <h3
              onClick={() => setActivePage("categories")}
              className={activePage === "categories" ? "ActiveLink" : ""}
            >
              Categories
            </h3>
          </li>
          <li>
            <h3
              onClick={() => setActivePage("Profile")}
              className={activePage === "Profile" ? "ActiveLink" : ""}
            >
              Admin Profile
            </h3>
          </li>
        </ul>
      </div>
      <div className="Main">
        {activePage === "Dashboard" ? (
          /* DASHBOARD START*/
          <div className="DashBoardInner">
            <div className="Cards-wrapper">
              <div
                className="Card"
                onClick={CountUsers}
                style={{ cursor: "pointer" }}
              >
                <h6>Logged in Users:</h6>
                <div className="counter-wrapper">
                  {activeUsers ? (
                    <h5>{activeUsers}</h5>
                  ) : (
                    <img
                      alt="loading"
                      className="Loading"
                      src={loadingDark}
                    ></img>
                  )}
                  <span
                    style={{
                      fontSize: "10px",
                      display: "block",
                      marginTop: "10px",
                    }}
                  >
                    (Click to update)
                  </span>
                </div>
              </div>
              <div
                className="Card"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setActivePage("Users");
                }}
              >
                <h6>Total Users Count:</h6>
                <h5>{statistics.UserCount && statistics.UserCount}</h5>
              </div>
              <div
                className="Card"
                onClick={() => {
                  setActivePage("Products");
                }}
                style={{ cursor: "pointer" }}
              >
                <h6>Total Products Sold:</h6>
                <h5>
                  {statistics.ProductsSold && statistics.ProductsSold.length}
                </h5>
              </div>
              <div className="Card">
                <h6>Net :</h6>
                <h5>{statistics.Net && Math.round(statistics.Net)}$</h5>
              </div>
              -
              <div className="Card">
                <h6>Discounts Made :</h6>
                <h5>
                  {statistics.TotalDiscount &&
                    Math.round(statistics.TotalDiscount)}
                  $
                </h5>
              </div>
              =
              <div className="Card">
                <h6>Revenue :</h6>
                <h5>{statistics.Revenue && Math.round(statistics.Revenue)}$</h5>
              </div>
            </div>
            <div className="Charts">
              {chartData ? <Pie className="Chart" data={chartData} /> : ""}
            </div>

            <div className="Notes">
              <h3>Notes</h3>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Add Note"
                  id="NoteValue"
                ></input>
                <button onClick={AddNote}>Save</button>
              </div>
              <div className="note-wrapper">
                {Notes &&
                  Notes.map((note, index) => {
                    return (
                      <div className="Note">
                        <p>
                          {index + 1}. {""}
                          {""}
                          {note.Text}
                        </p>
                        <p style={{ marginLeft: "auto" }}>by {note.Maker}</p>
                        <img
                          alt="loading"
                          src={deleteIcon}
                          onClick={() => {
                            DeleteNote(index);
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          /* DASHBOARD END*/
          ""
        )}
        {activePage === "Users" ? <Users UserList={UserList} /> : ""}
        {activePage === "Products" ? (
          <Products
            Data={props.Data}
            ProductData={productList}
            catagories={catagories}
          />
        ) : (
          ""
        )}
        {activePage === "Profile" ? (
          /* Profile START*/
          <>
            <div className="General">
              <h1>General info</h1>
              <form>
                <div id="Fname">
                  <label for="first-name">First Name:</label>
                  <input
                    type="text"
                    id="first-name"
                    name="Fname"
                    value={ActiveUser.Fname}
                    onChange={handleInput}
                  />
                </div>
                <div id="Lname">
                  <label for="last-name">Last Name:</label>
                  <input
                    type="text"
                    id="last-name"
                    name="Lname"
                    value={ActiveUser.Lname}
                    onChange={handleInput}
                  />
                </div>
                <div id="Username">
                  <label for="username">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="Username"
                    value={ActiveUser.Username}
                    onChange={handleInput}
                  />
                </div>
                <div id="Phone">
                  <label for="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={ActiveUser.phone}
                    onChange={handleInput}
                  />
                </div>
                <div id="Email">
                  <label for="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={ActiveUser.email}
                    onChange={handleInput}
                  />
                </div>
                <div id="Address">
                  <label for="address">Address:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={ActiveUser.address}
                    onChange={handleInput}
                  />
                </div>
                <div id="Gender">
                  <label for="gender">Gender:</label>
                  <select
                    id="gender"
                    name="gender"
                    value={ActiveUser.gender}
                    onChange={handleInput}
                  >
                    <option value="" selected disabled>
                      Select your gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div id="DOB">
                  <label for="birthdate">Date of Birth:</label>
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
                /* Profile END*/
              )}
            </div>
          </>
        ) : (
          ""
        )}
        {activePage === "categories" ? (
          <DashCate catagories={catagories} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
/*
    Revenue: 0,
    CartNum: 0,
    ProductsSold: [],
    notes: [],
    Net: 0,
    UserCount: 0,
    TotalDiscount: 0,
    WishNum: 0
 */