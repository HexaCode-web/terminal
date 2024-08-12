import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import secureLocalStorage from "react-secure-storage";
import { GETDOC, QUERY } from "../../server";

export default function History() {
  const [pending, setPending] = useState(null);
  const [data, setData] = useState([]);

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

  const fetchData = async () => {
    if (pending) {
      const data = await Promise.all(
        pending.map(async (order) => {
          const Product = await QUERY("products", "id", "==", order.product);
          console.log(Product[0]);
          return {
            id: order.ID,
            Date: order.CreatedAt,
            Order: (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  window.location.href = `/product/${order.product}`;
                }}
              >
                {Product[0].title}
              </span>
            ),
          };
        })
      );
      setData(data);
    }
  };

  useEffect(() => {
    const FetchUser = async () => {
      let id = JSON.parse(secureLocalStorage.getItem("activeUser")).id;
      const userDoc = await GETDOC("users", id);
      setPending(userDoc.pending);
    };
    FetchUser();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pending]);

  return (
    <div className="Container tableWrapper">
      <DataTable
        theme={localStorage.getItem("darkMode") ? "Light" : "dark"}
        columns={columns}
        data={data}
      />
    </div>
  );
}
