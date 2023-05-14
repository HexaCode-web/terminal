import React from "react";
import DataTable from "react-data-table-component";
import MyModal from "../Modal";
const DashHistory = (props) => {
  const [RejectReason, setRejectReason] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);

  const Products = props.productList;
  const TotalHistory = [...props.AcceptedOrders, ...props.RejectedOrders];
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrimaryAction = () => {
    handleCloseModal();
    setRejectReason("");
  };
  const columns = [
    {
      name: "Order ID",
      selector: (row) => row.ID,
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
      name: "User",
      selector: (row) => row.User,
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
    {
      name: "Action Taken By",
      selector: (row) => row.Owner,
      sortable: true,
      center: true,
    },
  ];
  const data = TotalHistory?.map((order) => {
    const maker = props.UserList.find((user) => {
      return user.id === order.user;
    });
    const product = Products?.find((product) => {
      return product.id === order.product;
    });
    return {
      Owner: order.ActionTakenBy,
      ID: order.ID,
      DateOrderMade: order.CreatedAt,
      DateActionTaken: order.DateActionTaken,
      User: (
        <div
          onClick={() => {
            window.location.href = `/Dashboard/user/${maker.id}`;
          }}
        >
          {maker?.Username}
        </div>
      ),
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
  return (
    <>
      <h1>Orders History</h1>
      <div className="Container">
        <DataTable theme="dark" columns={columns} data={data} />
      </div>
      <MyModal
        show={showModal}
        handleClose={handleCloseModal}
        title="Reason of rejected order"
        primaryButtonText="i understand"
        handlePrimaryAction={handlePrimaryAction}
      >
        <div style={{ textAlign: "center" }}>
          <p>this is why this order was rejected:</p>
          <br />
          <p style={{ fontSize: "1.2rem" }}>{RejectReason}</p>
        </div>
      </MyModal>
    </>
  );
};

export default DashHistory;
