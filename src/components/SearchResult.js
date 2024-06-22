/* eslint-disable array-callback-return */
import React, { useEffect } from "react";
import Card from "./Card/Card";

export default function ProductList(props) {
  let filteredData = props.List;
  return (
    <>
      <div
        className="Content"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "90%",
          gap: "0px",
          marginTop: "100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {filteredData.length === 0 ? (
            <h1> Whoops! no products were found! try changing your words!</h1>
          ) : (
            filteredData.map((product) => {
              return <Card key={product.id} product={product} />;
            })
          )}
        </div>
      </div>
    </>
  );
}
