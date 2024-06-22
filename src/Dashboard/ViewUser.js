import React from "react";
import { useParams } from "react-router-dom";
import { GETDOC, GETCOLLECTION, SETDOC } from "../../server";
import Calender from "../../assets/calendar.png";
import Gender from "../../assets/gender.png";
import Location from "../../assets/address.png";
import Error404 from "../../pages/Error404";
import Active from "../../assets/add-contact.png";
import Phone from "../../assets/phone.png";
import Loading from "../../assets/loadingDark.gif";
import loadingTransparent from "../../assets/loading-13.gif";
import Card from "../Card";
import DataTable from "react-data-table-component";
import MyModal from "../Modal";
import date from "date-and-time";

import { CreateToast } from "../../App";
export default function ViewUser() {
  const [user, setUser] = React.useState(null);
  const [ActivePage, setActivePage] = React.useState("personal");
  const [Products, setProducts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isLoadingOVERLAY, setIsLoadingOVERLAY] = React.useState(false);
  const [RejectReason, setRejectReason] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [reasonOfReject, setReasonOfReject] = React.useState("");
  const [targetOrder, setTargetOrder] = React.useState(null);
  const [showRejectOrderModal, setShowRejectOrderModal] = React.useState(false);
  const handleShowRejectModal = () => setShowRejectOrderModal(true);
  const [Error, setError] = React.useState(false);

  const handleCloseRejectModal = () => setShowRejectOrderModal(false);
  const handlePrimaryActionReject = () => {
    DeclineOrder(targetOrder, reasonOfReject);
  };
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = () => {
    handleCloseModal();
    setRejectReason("");
  };
  const id = useParams().ID;
  const pattern = date.compile("HH:mm ddd, MMM DD YYYY");
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

  const DeclineOrder = async (Order, reason) => {
    const now = new Date();
    setIsLoadingOVERLAY(true);
    handleCloseRejectModal();
    CreateToast("rejecting Order..", "info");
    const [fetchedStatistics, fetchedUser] = await Promise.all([
      GETDOC("statistics", 0),
      GETDOC("users", Order.user.id),
    ]);
    //remove the Order from pending list
    const PendingOrders = fetchedStatistics.PendingOrders.filter(
      (order) => order.ID !== Order.ID
    );
    const OrderToBeSent = {
      ...Order,
      product: Order.product.id,
      user: Order.user.id,
      Reason: reason,
      DateActionTaken: date.format(now, pattern),
      ActionTakenBy: props.ActiveUser.Username,
    };
    //push the Order to rejected list
    const RejectedOrders = [...fetchedStatistics.RejectedOrders, OrderToBeSent];
    //update the Statistics
    const updatedStatistics = {
      ...fetchedStatistics,
      RejectedOrders,
      PendingOrders,
    };
    //update the user
    const pendingOrders = fetchedUser.pending;
    const orderIndex = pendingOrders.findIndex(
      (order) => order.product === Order.product
    );
    if (orderIndex !== -1) {
      pendingOrders.splice(orderIndex, 1);
    }
    const updatedUserPendingList = pendingOrders;
    fetchedUser.history.push(OrderToBeSent);
    //send the data
    await Promise.all([
      SETDOC("statistics", 0, updatedStatistics),
      SETDOC("users", Order.user.id, {
        ...fetchedUser,
        pending: updatedUserPendingList,
      }),
    ]);
    //remove loading
    setIsLoadingOVERLAY(false);
    //update the ui
    setUser((prev) => {
      return { ...prev, pending: PendingOrders, history: fetchedUser.history };
    });
    CreateToast("Order rejected!", "success");
  };
  const AcceptOrder = async (Order) => {
    const now = new Date();
    setIsLoadingOVERLAY(true);
    CreateToast("accepting Order..", "info");
    const [fetchedStatistics, fetchedProduct, fetchedUser] = await Promise.all([
      GETDOC("statistics", 0),
      GETDOC("products", Order.product),
      GETDOC("users", Order.user),
    ]);
    const OrderToBeSent = {
      ...Order,
      product: Order.product,
      user: Order.user,
      Reason: "",
      DateActionTaken: date.format(now, pattern),
      ActionTakenBy: props.ActiveUser.Username,
    };
    if (fetchedProduct.stock <= 0) {
      CreateToast("Sorry, product is now out of stock", "error");
      setIsLoadingOVERLAY(false);
      return;
    }
    const discount = fetchedProduct.Offer
      ? (+fetchedProduct.price * fetchedProduct.discountPercentage) / 100
      : 0;
    //remove the Order from pending list
    const PendingOrders = fetchedStatistics.PendingOrders.filter(
      (order) => order.ID !== Order.ID
    );
    //push the Order to accepted list
    const AcceptedOrders = [...fetchedStatistics.AcceptedOrders, OrderToBeSent];
    //update the statitcs
    const updatedStatistics = {
      ...fetchedStatistics,
      AcceptedOrders,
      PendingOrders,
      Net: Math.round(+fetchedStatistics.Net + fetchedProduct.price),
      TotalDiscount: Math.round(fetchedStatistics.TotalDiscount + discount),
      Revenue:
        fetchedStatistics.Net +
        +fetchedProduct.price -
        fetchedStatistics.TotalDiscount -
        discount,
    };
    //update the product
    const updatedProduct = {
      ...fetchedProduct,
      stock: fetchedProduct.stock - 1,
      Sold: fetchedProduct.Sold + 1,
    };
    //update the user
    const pendingOrders = fetchedUser.pending;
    const orderIndex = pendingOrders.findIndex(
      (order) => order.product === Order.product
    );
    if (orderIndex !== -1) {
      pendingOrders.splice(orderIndex, 1);
    }
    const updatedUserPendingList = pendingOrders;
    fetchedUser.history.push(OrderToBeSent);
    //send the data
    await Promise.all([
      SETDOC("statistics", 0, updatedStatistics),
      SETDOC("products", Order.product, updatedProduct),
      SETDOC("users", Order.user, {
        ...fetchedUser,
        pending: updatedUserPendingList,
      }),
    ]);
    //remove loading
    setIsLoadingOVERLAY(false);
    //update the ui
    setUser((prev) => {
      return { ...prev, pending: PendingOrders, history: fetchedUser.history };
    });
    CreateToast("Order accepted!", "success");
  };
  React.useEffect(() => {
    const fetchUser = async () => {
      await GETDOC("users", id).then((res) =>
        res !== "Error" ? setUser(res) : setError(true)
      );
      await GETCOLLECTION("products").then((res) => {
        setProducts(res);
      });
    };
    fetchUser();
    setLoading(false);
  }, []);

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
      name: "Options",
      selector: (row) => row.Options,
      center: true,
    },
  ];
  const dataForPending = user?.pending?.map((Order) => {
    const product = Products?.find((product) => {
      return product.id === Order.product;
    });
    return {
      ID: +Order.ID,
      ProductID: +product?.id,
      Product: (
        <div
          onClick={() => {
            window.location.href = `/Dashboard/product/${product.id}`;
          }}
        >
          {product?.title}
        </div>
      ),
      Options: (
        <div className="buttonWrapper">
          <button
            className="button"
            onClick={() => {
              AcceptOrder(Order);
            }}
          >
            accept
          </button>
          <button
            className="button Danger"
            onClick={() => {
              setTargetOrder({ ...Order, user, product }),
                handleShowRejectModal();
            }}
          >
            reject
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="ViewUser">
      {Error ? <Error404 /> : ""}
      {isLoadingOVERLAY && (
        <div className="overlay">
          <img src={loadingTransparent}></img>
        </div>
      )}
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
              </ul>
            </div>
            <div className="Right">
              {ActivePage === "personal" && (
                <div className="Card-wrapper">
                  <div className="Card animate__animated  animate__fadeInLeft">
                    <div className="header">
                      <p className="CardTitle">Phone Number</p>
                      <img src={Phone}></img>
                    </div>
                    <p className="CardInfo">{user.phone}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInRight"
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
                    className="Card animate__animated  animate__fadeInLeft"
                    style={{ animationDelay: ".5s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Gender</p>
                      <img src={Gender}></img>
                    </div>
                    <p className="CardInfo">{user.gender}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInRight"
                    style={{ animationDelay: ".6s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Date of Birth</p>
                      <img src={Calender}></img>
                    </div>
                    <p className="CardInfo">{user.dateOfBirth}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInLeft"
                    style={{ animationDelay: ".7s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Address</p>
                      <img src={Location}></img>
                    </div>
                    <p className="CardInfo">{user.address}</p>
                  </div>
                  <div
                    className="Card animate__animated  animate__fadeInRight"
                    style={{ animationDelay: ".8s" }}
                  >
                    <div className="header">
                      <p className="CardTitle">Logged In</p>
                      <img src={Active}></img>
                    </div>
                    <p className="CardInfo">{user.Active ? "Yes" : "No"}</p>
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
      <MyModal
        show={showRejectOrderModal}
        handleClose={handleCloseRejectModal}
        title="Reject Order"
        primaryButtonText={`reject ${
          targetOrder ? targetOrder.user.Username : ""
        }'s order`}
        handlePrimaryAction={handlePrimaryActionReject}
      >
        <div className="RejectPopUp">
          <p>why do you want to reject this order </p>
          <textarea
            value={reasonOfReject}
            onChange={(event) => {
              setReasonOfReject(event.target.value);
            }}
          ></textarea>
        </div>
      </MyModal>
    </div>
  );
}
/*{
    "pending": [
        {
            "product": 0,
            "user": 2,
            "ID": "47938153",
            "CreatedAt": "1:17 Fri, Apr 28 2023"
        },
        {
            "ID": "62083247",
            "product": 10,
            "CreatedAt": "02:06 Fri, Apr 28 2023",
            "user": 2
        }
    ]
}
*/
