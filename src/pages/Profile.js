import React, { useEffect } from "react";
import { GETDOC, GETCOLLECTION } from "../server";
import Calender from "../assets/calendar.png";
import Gender from "../assets/gender.png";
import Location from "../assets/address.png";
import Active from "../assets/add-contact.png";
import pending from "../assets/Pending.png";
import successful from "../assets/successful.png";
import rejected from "../assets/Rejected.png";
import Phone from "../assets/phone.png";
import Loading from "../assets/loadingDark.gif";
import Card from "../components/Card";
import DataTable from "react-data-table-component";
import MyModal from "../components/Modal";
import { CreateToast } from "../App";
import secureLocalStorage from "react-secure-storage";
export default function ViewUser() {
  const [user, setUser] = React.useState(null);
  const [ActivePage, setActivePage] = React.useState("personal");
  const [Products, setProducts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [RejectReason, setRejectReason] = React.useState("");
  let AcceptedOrders = [];
  let RejectedOrders = [];
  const [showModal, setShowModal] = React.useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = () => {
    handleCloseModal();
    setRejectReason("");
  };
  function timeSince(dateString) {
    const dateParts = dateString.split("/");
    const year = parseInt(dateParts[2], 10) + 2000; // add 2000 to two-digit year
    const month = parseInt(dateParts[1], 10) - 1; // subtract 1 from month (0-indexed)
    const day = parseInt(dateParts[0], 10);
    const date = new Date(year, month, day);

    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) {
      return seconds + " second" + (seconds === 1 ? "" : "s") + " ago";
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes + " minute" + (minutes === 1 ? "" : "s") + " ago";
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours + " hour" + (hours === 1 ? "" : "s") + " ago";
    }
    const days = Math.floor(hours / 24);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
  }

  React.useEffect(() => {
    const fetchUser = async () => {
      await GETDOC(
        "users",
        JSON.parse(secureLocalStorage.getItem("activeUser")).id
      ).then((res) => setUser(res));
      await GETCOLLECTION("products").then((res) => {
        setProducts(res);
      });
    };
    fetchUser();
    setLoading(false);
  }, []);
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
      GETDOC("users", user.id).then((res) => {
        fetchedData = res;
        CheckInfo(fetchedData);
      });
    };
    if (ActivePage === "personal") {
      checkData();
    }
  }, [user]);
  const columnsForHistory = [
    {
      name: "Order ID",
      selector: (row) => row.ID,
      sortable: true,
      center: true,
    },
    {
      name: "Action Taken By",
      selector: (row) => row.Owner,
      sortable: true,
      center: true,
    },
    {
      name: "status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Product",
      selector: (row) => row.Product,
      sortable: true,
      center: true,
    },
    {
      name: "Date Order Made",
      selector: (row) => row.DateOrderMade,
      sortable: true,
      center: true,
    },
    {
      name: "Date Action Taken",
      selector: (row) => row.DateActionTaken,
      sortable: true,
      center: true,
    },
  ];
  const DataForHistory = user?.history?.map((order) => {
    const product = Products?.find((product) => {
      return product.id === order.product;
    });
    return {
      Owner: order.ActionTakenBy,
      ID: order.ID,
      DateOrderMade: order.CreatedAt,
      DateActionTaken: order.DateActionTaken,
      Product: (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = `/product/${product.id}`;
          }}
        >
          {product?.title}
        </span>
      ),
      status: order.Reason ? (
        <span
          style={{ cursor: "pointer" }}
          className="status"
          onClick={() => {
            setRejectReason(order.Reason);
            handleShowModal();
          }}
        >
          rejected
        </span>
      ) : (
        <span className="status" style={{ background: "green" }}>
          accepted
        </span>
      ),
    };
  });
  const columnsForPending = [
    {
      name: "Order ID",
      selector: (row) => row.ID,
      sortable: true,
      center: true,
    },
    {
      name: "Product ID",
      selector: (row) => row.ProductID,
      sortable: true,
      center: true,
    },
    {
      name: "Product",
      selector: (row) => row.Product,
      sortable: true,
      center: true,
    },
    {
      name: "Date Made",
      selector: (row) => row.Date,
      sortable: true,
      center: true,
    },
  ];
  const dataForPending = user?.pending?.map((Order) => {
    const product = Products?.find((product) => {
      return product.id === Order.product;
    });
    return {
      Date: Order.CreatedAt,
      ID: +Order.ID,
      ProductID: +product?.id,
      Product: (
        <div
          onClick={() => {
            window.location.href = `/product/${product.id}`;
          }}
        >
          {product?.title}
        </div>
      ),
    };
  });
  user?.history?.forEach((Order) => {
    if (Order.Reason) {
      RejectedOrders.push(Order);
    } else {
      AcceptedOrders.push(Order);
    }
  });
  return (
    <div className="ViewUser">
      {loading && (
        <img src={Loading} style={{ width: "100px", margin: "auto" }} />
      )}
      {user && (
        <>
          <h3 className="animate__animated  animate__fadeInLeft">
            {user.Fname} {user.Lname}'s profile
          </h3>
          <div className="Content">
            <div className="Left animate__animated  animate__fadeInDown">
              <p className="UserName animate__animated  animate__backInDown">
                {user.Username}
              </p>
              <span
                className="Email animate__animated  animate__backInDown"
                style={{ animationDelay: ".3s" }}
              >
                {user.email}
              </span>
              <ul className="Navigation">
                <li
                  onClick={() => setActivePage("personal")}
                  className={`${
                    ActivePage === "personal" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown `}
                >
                  Personal info
                </li>
                <li
                  onClick={() => setActivePage("Products")}
                  style={{ animationDelay: ".3s" }}
                  className={`${
                    ActivePage === "Products" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown`}
                >
                  Products in Cart
                </li>
                <li
                  onClick={() => setActivePage("WishList")}
                  style={{ animationDelay: ".4s" }}
                  className={`${
                    ActivePage === "WishList" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown `}
                >
                  WishList
                </li>
                <li
                  onClick={() => setActivePage("History")}
                  style={{ animationDelay: ".5s" }}
                  className={`${
                    ActivePage === "History" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown `}
                >
                  History
                </li>
                <li
                  onClick={() => setActivePage("PendingOrders")}
                  style={{ animationDelay: ".6s" }}
                  className={`${
                    ActivePage === "PendingOrders" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown `}
                >
                  PendingOrders
                </li>
                <li
                  onClick={() => (window.location.href = "/User/Settings")}
                  style={{ animationDelay: ".6s" }}
                  className={`${
                    ActivePage === "PendingOrders" ? "ActiveLink" : ""
                  } animate__animated animate__backInDown `}
                >
                  Settings
                </li>
              </ul>
            </div>
            <div className="Right">
              {ActivePage === "personal" && (
                <div className="Card-wrapper">
                  <div className="Card animate__animated  animate__fadeInLeft">
                    <div className="header">
                      <p className="CardTitle">Full Name</p>
                      <img src={Phone}></img>
                    </div>
                    <p className="CardInfo">
                      {user.Fname} {user.Lname}
                    </p>
                  </div>
                  <div className="Card animate__animated  animate__fadeInRight">
                    <div className="header">
                      <p className="CardTitle">Phone Number</p>
                      <img src={Phone}></img>
                    </div>
                    <p className="CardInfo">{user.phone}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInLeft"
                    style={{ animationDelay: ".4s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Date Joined</p>
                      <img src={Calender}></img>
                    </div>
                    <p className="CardInfo">{user.joinedAt}</p>
                    <span className="SubText">{timeSince(user.joinedAt)}</span>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInRight"
                    style={{ animationDelay: ".5s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Gender</p>
                      <img src={Gender}></img>
                    </div>
                    <p className="CardInfo">{user.gender}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInLeft"
                    style={{ animationDelay: ".6s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Date of Birth</p>
                      <img src={Calender}></img>
                    </div>
                    <p className="CardInfo">{user.dateOfBirth}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInRight"
                    style={{ animationDelay: ".7s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Address</p>
                      <img src={Location}></img>
                    </div>
                    <p className="CardInfo">{user.address}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInLeft"
                    style={{ animationDelay: ".8s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Logged In</p>
                      <img src={Active}></img>
                    </div>
                    <p className="CardInfo">{user.Active ? "Yes" : "No"}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInUp"
                    style={{ animationDelay: ".9s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Pending Orders</p>
                      <img src={pending}></img>
                    </div>
                    <p className="CardInfo">{user.pending.length}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInUp"
                    style={{ animationDelay: "1.1s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">successful Orders</p>
                      <img src={successful}></img>
                    </div>
                    <p className="CardInfo">{AcceptedOrders.length}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInUp"
                    style={{ animationDelay: "1.2s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Rejected Orders</p>
                      <img src={rejected}></img>
                    </div>
                    <p className="CardInfo">{RejectedOrders.length}</p>
                  </div>
                </div>
              )}
              {ActivePage === "Products" ? (
                user.cart.length <= 0 ? (
                  <h4 style={{ textAlign: "center" }}>
                    no products in cart yet
                  </h4>
                ) : (
                  user.cart.map((product) => {
                    return <Card product={product} />;
                  })
                )
              ) : (
                ""
              )}
              {ActivePage === "WishList" ? (
                user.wishlist.length <= 0 ? (
                  <h4 style={{ textAlign: "center" }}>
                    no products in wishlist yet
                  </h4>
                ) : (
                  user.wishlist.map((product) => {
                    return <Card product={product} />;
                  })
                )
              ) : (
                ""
              )}
              {ActivePage === "History" ? (
                user.history.length <= 0 ? (
                  <h4 style={{ textAlign: "center" }}>
                    {user.Fname} {user.Lname} hasn't bought anything yet
                  </h4>
                ) : (
                  <DataTable
                    className="animate__animated  animate__fadeIn"
                    theme="dark"
                    columns={columnsForHistory}
                    data={DataForHistory}
                  />
                )
              ) : (
                ""
              )}
              {ActivePage === "PendingOrders" ? (
                user.pending.length <= 0 ? (
                  <h4 style={{ textAlign: "center" }}>
                    {user.Fname} {user.Lname} doesn't have any Pending Orders
                  </h4>
                ) : (
                  <DataTable
                    className="animate__animated  animate__fadeIn"
                    theme="dark"
                    columns={columnsForPending}
                    data={dataForPending}
                  />
                )
              ) : (
                ""
              )}
            </div>
          </div>
        </>
      )}
      <MyModal
        show={showModal}
        handleClose={handleCloseModal}
        title="Reason of rejected order"
        primaryButtonText="okay"
        handlePrimaryAction={handlePrimaryAction}
      >
        <div style={{ textAlign: "center" }}>
          <p>Reason of rejection:</p>
          <br />
          <p style={{ fontSize: "1.2rem" }}>{RejectReason}</p>
        </div>
      </MyModal>
    </div>
  );
}
/*  

*/
