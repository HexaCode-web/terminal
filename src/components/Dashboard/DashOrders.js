import React, { useEffect } from "react";
import { GETDOC, SETDOC } from "../../server";
import loadingTransparent from "../../assets/loading-13.gif";
import { CreateToast } from "../../App";
import MyModal from "../Modal/Modal";
import DataTable from "react-data-table-component";
import date from "date-and-time";
import "./DashOrders.css";
export default function PendingOrders(props) {
  const [orders, setOrders] = React.useState(props.orders);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [targetOrder, setTargetOrder] = React.useState(null);
  const [reasonOfReject, setReasonOfReject] = React.useState("");
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = () => {
    DeclineOrder(targetOrder, reasonOfReject);
  };
  useEffect(() => {
    const handleWindowFocus = async () => {
      await GETDOC("statistics", 0).then((res) => {
        setOrders(res.PendingOrders);
      });
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);
  const pattern = date.compile("HH:mm ddd, MMM DD YYYY");

  const DeclineOrder = async (Order, reason) => {
    const now = new Date();
    setIsLoading(true);
    handleCloseModal();
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
    setIsLoading(false);
    //update the ui
    setOrders(PendingOrders);
    CreateToast("Order rejected!", "success");
  };
  const AcceptOrder = async (Order) => {
    const now = new Date();
    setIsLoading(true);
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
      setIsLoading(false);
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
      NetAfterProductCost: Math.round(
        +fetchedStatistics.Net +
          fetchedProduct.price -
          fetchedProduct.cost -
          discount
      ),

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
    setIsLoading(false);
    //update the ui
    setOrders(PendingOrders);
    CreateToast("Order accepted!", "success");
  };

  const columns = [
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
      name: "User",
      selector: (row) => row.User,
      sortable: true,
      center: true,
    },
    {
      name: "Options",
      selector: (row) => row.Options,
      center: true,
    },
  ];

  const data = orders?.map((Order) => {
    const product = props.productList.find((product) => {
      return product.id === Order.product;
    });
    const maker = props.UserList.find((user) => {
      return user.id === Order.user;
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
      User: (
        <div
          onClick={() => {
            window.location.href(`/Dashboard/user/${maker.id}`);
          }}
        >
          {maker?.Username}
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
              setTargetOrder({ ...Order, user: maker, product }),
                handleShowModal();
            }}
          >
            reject
          </button>
        </div>
      ),
    };
  });
  return (
    <div className="Pending">
      <MyModal
        show={showModal}
        handleClose={handleCloseModal}
        title="Reject Order"
        primaryButtonText={`reject ${
          targetOrder ? targetOrder.user.Username : ""
        }'s order`}
        handlePrimaryAction={handlePrimaryAction}
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
      {isLoading && (
        <div className="overlay">
          <img src={loadingTransparent}></img>
        </div>
      )}
      <h1> Pending Orders</h1>
      <div className="tableWrapper">
        <DataTable
          theme={localStorage.getItem("darkMode") ? "Light" : "dark"}
          columns={columns}
          data={data}
        />
      </div>
    </div>
  );
}
