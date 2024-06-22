import React, { useEffect } from "react";
import DataTable from "react-data-table-component";
import secureLocalStorage from "react-secure-storage";
import { GETDOC } from "../../server";
import MyModal from "../../components/Modal/Modal";

export default function History() {
  const [pending, setPending] = React.useState(null);
  const columns = [
    {
      name: "Order",
      selector: (row) => row.Order,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.Date,
      sortable: true,
    },
  ];

  const data = pending?.map((order) => {
    console.log(order);
    return {
      id: order.ID,
      Date: order.CreatedAt,
      Order: (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = `/product/${order.Order.id}`;
          }}
        >
          {order.Order.title}
        </span>
      ),
    };
  });

  useEffect(() => {
    const FetchUser = async () => {
      let id = JSON.parse(secureLocalStorage.getItem("activeUser")).id;
      await GETDOC("users", id).then((res) => {
        setPending(res.pending);
      });
    };
    FetchUser();
  }, []);
  return (
    <div className="Container tableWrapper">
      <DataTable theme="dark" columns={columns} data={data} />
    </div>
  );
}
