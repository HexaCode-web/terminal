import React, { useEffect } from "react";
import DataTable from "react-data-table-component";
import secureLocalStorage from "react-secure-storage";
import { GETCOLLECTION, GETDOC } from "../../server";
import MyModal from "../../components/Modal/Modal";

export default function History() {
  const [history, setHistory] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [products, SetProducts] = React.useState(null);
  const [RejectReason, setRejectReason] = React.useState("");
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = () => {
    handleCloseModal();
    setRejectReason("");
  };

  const columns = [
    {
      name: "Order",
      selector: (row) => row.Order,
      sortable: true,
    },
    {
      name: "status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Date order was made",
      selector: (row) => row.DateOrderMade,
      sortable: true,
    },
    {
      name: "Action taken on",
      selector: (row) => row.DateActionTaken,
      sortable: true,
    },
  ];

  const data = history?.map((order) => {
    const product = products?.find((product) => {
      return product.id === order.product;
    });
    return {
      DateOrderMade: order.CreatedAt,
      DateActionTaken: order.DateActionTaken,
      Order: (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = `/product/${order.Order.id}`;
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

  useEffect(() => {
    const FetchData = async () => {
      let id = JSON.parse(secureLocalStorage.getItem("activeUser")).id;
      await GETDOC("users", id).then((res) => {
        setHistory(res.history);
      });
      await GETCOLLECTION("products").then((res) => {
        SetProducts(res);
      });
    };
    FetchData();
  }, []);
  return (
    <div
      className="Container History"
      style={{ maxWidth: "1300px", margin: "auto" }}
    >
      <MyModal
        show={showModal}
        handleClose={handleCloseModal}
        title="Reason of rejected order"
        primaryButtonText="i understand"
        handlePrimaryAction={handlePrimaryAction}
      >
        <div style={{ textAlign: "center" }}>
          <p>this is why your order was rejected:</p>
          <br />
          <p style={{ fontSize: "1.2rem" }}>{RejectReason}</p>
        </div>
      </MyModal>
      <div className="tableWrapper" style={{ width: "fitContent" }}>
        <DataTable theme="dark" columns={columns} data={data} />
      </div>
    </div>
  );
}
