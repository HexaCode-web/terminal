/* DATABASE end*/
import React, { useEffect } from "react";
import deleteIcon from "../assets/delete.png";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import Users from "../components/Dashboard/DashUsers";
import Products from "../components/Dashboard/DashProducts";
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css";
import secureLocalStorage from "react-secure-storage";
import DashCate from "../components/Dashboard/DashCate";
import date from "date-and-time";
import { CreateToast } from "../App";
import { GETCOLLECTION, GETDOC, SETDOC, productDistributor } from "../server";
import PendingOrders from "../components/Dashboard/DashOrders";
import DashHistory from "../components/Dashboard/DashHistory";
import AdminProfile from "../components/Dashboard/AdminProfile";
import WebSettings from "../components/Dashboard/WebSettings";
ChartJS.register(ArcElement, Tooltip, Legend);
import Widget from "../components/Dashboard/Widget";
export default function DashBoard(props) {
  const [ActiveUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  const [statistics, setStatistics] = React.useState({});
  const [oldStatistics, setOldStatistics] = React.useState(null);
  const [greeting, setGreeting] = React.useState("");
  const [activeUsers, setActiveUsers] = React.useState(0);
  const [compareValues, setCompareValues] = React.useState({
    CartNum: 0,
    AcceptedOrders: 0,
    Net: 0,
    PendingOrders: 0,
    LoggedInUsers: 0,
    Products: 0,
    RejectedOrders: 0,
    Revenue: 0,
    TotalDiscount: 0,
    UserCount: 0,
    notes: 0,
  });
  const [UserList, setUserList] = React.useState([]);
  const [catagories, setCatagories] = React.useState([]);
  const [productList, setProductList] = React.useState([]);
  const [activePage, setActivePage] = React.useState("Overview");
  const [chartData, setChartData] = React.useState(null);
  const [Notes, setNotes] = React.useState([]);

  /*GETTING NUMBERS*/
  const fetchNumbers = async () => {
    let catagoriesLocal = {};

    await GETCOLLECTION("categories").then((res) => {
      setCatagories(res);
      catagoriesLocal = res;
    });
    const UserList = await GETCOLLECTION("users");
    setUserList(UserList.filter((user) => user.deleteUser === false));
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
    let fetchedData = await GETDOC("statistics", 0);
    setStatistics(fetchedData);
    setNotes(fetchedData.notes);
  };
  const compareTime = async () => {
    // Get the old statistics data
    let oldStatisticsData = await GETDOC("statistics", "OldVersion");

    // Parse the date string from the old data and calculate the time difference in hours
    const pastDate = new Date(oldStatisticsData.DateMade.replace(",", ""));
    const currentDate = new Date();
    const timeDiffInHours =
      (currentDate.getTime() - pastDate.getTime()) / 1000 / 60 / 60;

    // Check if at least 24 hours have passed since the old data was fetched
    const is24HoursPassed = timeDiffInHours >= 24;

    // Set the old statistics data state
    setOldStatistics(oldStatisticsData);

    if (is24HoursPassed) {
      // If 24 hours have passed, fetch new statistics data and update the old data
      console.log("24 hours have passed. Updating old statistics data...");

      let newStatisticsData = await GETDOC("statistics", 0);

      // Format the current date in a specific pattern and update the old data with the new statistics data
      const now = new Date();
      const formattedDate = date.format(now, "YYYY/MM/DD HH:mm:ss");
      compareData();
      await SETDOC("statistics", "OldVersion", {
        ...newStatisticsData,
        DateMade: formattedDate,
      });
    } else {
      // If less than 24 hours have passed, log a message and return
      console.log("Less than 24 hours have passed. Skipping update...");
      return;
    }
  };

  const compareData = () => {
    // Compare the new and old statistics data and log the results
    if (statistics && oldStatistics) {
      let percentDiffObject = {};

      // loop over each key in statistics object
      for (let key in statistics) {
        if (typeof statistics[key] === "object") {
          const currentPercentDiff =
            oldStatistics[key].length === 0
              ? 0
              : ((statistics[key].length - oldStatistics[key].length) /
                  oldStatistics[key].length) *
                100;
          // add percentage difference to object
          percentDiffObject[key] = currentPercentDiff.toFixed(2);
        } else {
          // calculate percentage difference for the current key
          const currentPercentDiff =
            ((statistics[key] - oldStatistics[key]) / oldStatistics[key]) * 100;

          // add percentage difference to object
          percentDiffObject[key] = currentPercentDiff.toFixed(2);
        }
      }
      // set state with new object
      setCompareValues(percentDiffObject);
    }
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
    document.querySelector("#NoteValue").value = "";
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
    compareTime();
    if (new Date().getHours() < 12) setGreeting("Good morning");
    else if (new Date().getHours() < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    document.title = `${document.title} | Dashboard`;
  }, []);
  useEffect(() => {
    if (!(Object.keys(statistics).length === 0)) {
      SETDOC("statistics", 0, {
        ...statistics,
        UserCount: UserList.length,
        Products: productList?.length,
        LoggedInUsers: activeUsers,
      });
      compareData();
    }
  }, [statistics]);
  useEffect(() => {
    const fetchData = async () => {
      setStatistics(await GETDOC("statistics", 0));
    };
    fetchData();
  }, [activePage]);
  const CheckInfo = (res) => {
    const vals = Object.keys(res).map(function (key) {
      return res[key];
    });
    for (let index = 0; index < vals.length; index++) {
      if (typeof vals[index] !== "boolean") {
        if (typeof vals[index] !== "object")
          if (vals[index] !== 0) {
            if (!vals[index]) {
              CreateToast(
                `your Profile is incomplete! go to ${
                  res.admin ? "Admin Profile" : "settings"
                } to complete it`,
                "warn"
              );
              return;
            }
          }
      }
    }
  };
  useEffect(() => {
    const checkData = async () => {
      let fetchedData = {};
      GETDOC("users", ActiveUser.id).then((res) => {
        fetchedData = res;
        setActiveUser(res);
        CheckInfo(fetchedData);
      });
    };
    checkData();
  }, []);
  useEffect(() => {
    const handleWindowFocus = async () => {
      await GETDOC("statistics", 0).then((res) => {
        setStatistics(res);
      });
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);
  return (
    <div className="Dashboard">
      {props.UserUpdated && CreateToast("Updated your info!", "success")}
      <div className="SideBar">
        <h3 className="Greet">
          <span className=" animate__animated animate__fadeInUp">
            {greeting}
          </span>{" "}
          <br />
          <br />
          <span
            className=" animate__animated animate__fadeInUp"
            style={{ animationDelay: ".3s" }}
          >
            {ActiveUser.Username}
          </span>
        </h3>
        <ul className="BTNList">
          <li>
            <span
              style={{ animationDelay: ".4s" }}
              className="animate__animated animate__fadeInLeft"
            >
              -Main
            </span>
            <ul>
              <li>
                <h3
                  style={{ animationDelay: ".4s" }}
                  onClick={() => setActivePage("Overview")}
                  className={`${
                    activePage === "Overview" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Overview
                </h3>
              </li>
            </ul>
          </li>
          <li>
            <span
              style={{ animationDelay: ".5s" }}
              className="animate__animated animate__fadeInLeft"
            >
              -Lists
            </span>
            <ul>
              <li>
                <h3
                  style={{ animationDelay: ".5s" }}
                  onClick={() => setActivePage("Users")}
                  className={`${
                    activePage === "Users" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Users
                </h3>
              </li>
              <li>
                <h3
                  style={{ animationDelay: ".6s" }}
                  onClick={() => setActivePage("Products")}
                  className={`${
                    activePage === "Products" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Products
                </h3>
              </li>
              <li>
                <h3
                  style={{ animationDelay: ".7s" }}
                  onClick={() => setActivePage("categories")}
                  className={`${
                    activePage === "categories" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Categories
                </h3>
              </li>
            </ul>
          </li>
          <li>
            <span
              style={{ animationDelay: ".9s" }}
              className="animate__animated animate__fadeInLeft"
            >
              -Orders
            </span>
            <ul>
              <li>
                <h3
                  style={{ animationDelay: ".9s" }}
                  onClick={() => setActivePage("Pending")}
                  className={`${
                    activePage === "Pending" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Pending Orders
                </h3>
              </li>
              <li>
                <h3
                  style={{ animationDelay: "1s" }}
                  onClick={() => setActivePage("OrderHistory")}
                  className={`${
                    activePage === "OrderHistory" ? "ActiveLink" : ""
                  } animate__animated animate__fadeInLeft`}
                >
                  Order History
                </h3>
              </li>
            </ul>
          </li>
          <li>
            <span
              style={{ animationDelay: "1.1s" }}
              className="animate__animated animate__fadeInLeft"
            >
              -Customize
            </span>
            <h3
              style={{ animationDelay: "1.1s" }}
              onClick={() => setActivePage("WebSettings")}
              className={`${
                activePage === "WebSettings" ? "ActiveLink" : ""
              } animate__animated animate__fadeInLeft`}
            >
              Website Settings
            </h3>
          </li>
          <li>
            {" "}
            <span
              style={{ animationDelay: ".8s" }}
              className="animate__animated animate__fadeInLeft"
            >
              -Admin
            </span>
            <h3
              style={{ animationDelay: ".8s" }}
              onClick={() => setActivePage("Profile")}
              className={`${
                activePage === "Profile" ? "ActiveLink" : ""
              } animate__animated animate__fadeInLeft`}
            >
              Admin Profile
            </h3>
          </li>
        </ul>
      </div>
      <div className="Main">
        {activePage === "Overview" ? (
          /* DASHBOARD START*/
          <div className="DashBoardInner">
            <div className="Cards-wrapper animate__animated animate__fadeIn">
              <Widget
                delay="0"
                data={{
                  Title: "Users:",
                  Info: UserList.length,
                  Link: "Users",
                  percent: compareValues.UserCount,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".1"
                data={{
                  Title: "Logged in Users:",
                  Info: activeUsers,
                  Link: "",
                  percent: compareValues.LoggedInUsers,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".2s"
                data={{
                  Title: "Products:",
                  Info: productList.length,
                  Link: "Products",
                  percent: compareValues.Products,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".3s"
                data={{
                  Title: "Total Earnings:",
                  Info: statistics.Revenue,
                  Link: "",
                  percent: compareValues.Revenue,
                  Dollar: true,
                }}
                setActivePage={setActivePage}
              />
            </div>

            <div className="Charts ">
              <div className="Left" style={{ marginRight: "60px" }}>
                <h3 style={{ textAlign: "center" }}>daily income</h3>
                <div className="Progress">
                  {statistics?.Revenue - oldStatistics?.Revenue === 0 ? (
                    <p style={{ textAlign: "center" }}>no sales were made</p>
                  ) : (
                    <>
                      <Pie
                        className="Chart animate__animated animate__backInRight"
                        data={{
                          labels: ["Profit", "Discounts"],
                          datasets: [
                            {
                              label: "$",
                              data: [
                                statistics?.Revenue - oldStatistics?.Revenue,
                                statistics?.TotalDiscount -
                                  oldStatistics?.TotalDiscount,
                              ],
                              backgroundColor: [
                                "rgba(57, 204, 110, 0.4)",
                                "rgba(255, 0, 0, 0.8)",
                              ],
                              borderColor: ["#27ae60", "#ee233a"],
                              borderWidth: 1,
                            },
                          ],
                        }}
                      />
                      <p>Total daily Profit :</p>
                      <h3> {statistics?.Revenue - oldStatistics?.Revenue}$</h3>
                      <div className="SideNumbers">
                        <div className="Left">
                          <p> Discounts :</p>
                          <span>
                            {statistics?.TotalDiscount -
                              oldStatistics?.TotalDiscount}
                            $
                          </span>
                        </div>
                        <div className="Right">
                          <p> Sales :</p>
                          <span>{statistics?.Net - oldStatistics?.Net}$</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="Right">
                <h3 style={{ textAlign: "center" }}>Products Data</h3>
                {chartData ? (
                  <Pie
                    className="Chart animate__animated animate__backInRight"
                    data={chartData}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="Cards-wrapper">
              <Widget
                delay=".4s"
                data={{
                  Title: "OverAll Discounts:",
                  Info: statistics.TotalDiscount,
                  Link: "",
                  percent: "",
                  Dollar: true,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".5s"
                data={{
                  Title: "Overall Profit Before Discounts:",
                  Info: statistics.Net,
                  Link: "",
                  percent: compareValues.Net,
                  Dollar: true,
                }}
                setActivePage={setActivePage}
              />
            </div>
            <div className="Cards-wrapper">
              <Widget
                delay=".6s"
                data={{
                  Title: "Pending Orders:",
                  Info: statistics.PendingOrders?.length,
                  Link: "Pending",
                  percent: compareValues.PendingOrders,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".7s"
                data={{
                  Title: "Accepted Orders:",
                  Info: statistics.AcceptedOrders?.length,
                  Link: "OrderHistory",
                  percent: compareValues.AcceptedOrders,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
              <Widget
                delay=".8s"
                data={{
                  Title: "Declined Orders:",
                  Info: statistics.RejectedOrders?.length,
                  Link: "OrderHistory",
                  percent: compareValues.RejectedOrders,
                  Dollar: false,
                }}
                setActivePage={setActivePage}
              />
            </div>
            <h3>Notes</h3>
            <div className="Notes animate__animated animate__backInUp">
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
        {activePage === "Users" ? <Users /> : ""}
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
          <AdminProfile ActiveUser={ActiveUser} UpdateUser={props.UpdateUser} />
        ) : (
          ""
        )}
        {activePage === "categories" ? (
          <DashCate catagories={catagories} />
        ) : (
          ""
        )}
        {activePage === "Pending" ? (
          <PendingOrders
            orders={statistics.PendingOrders}
            setActivePage={setActivePage}
            UserList={UserList}
            productList={productList}
            ActiveUser={ActiveUser}
          />
        ) : (
          ""
        )}
        {activePage === "OrderHistory" ? (
          <DashHistory
            AcceptedOrders={statistics.AcceptedOrders}
            RejectedOrders={statistics.RejectedOrders}
            productList={productList}
            UserList={UserList}
          />
        ) : (
          ""
        )}
        {activePage === "WebSettings" ? (
          <WebSettings productList={productList} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
