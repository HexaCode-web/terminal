import React, { useEffect } from "react";
import Carousel from "../components/carosuel";
import { GETDOC } from "../server";
import Star from "../assets/star-empty.png";
import starFilled from "../assets/star-filled.png";
export default function HottestProducts() {
  const [Products, setProducts] = React.useState([]);
  useEffect(() => {
    const FetchData = async () => {
      GETDOC("websiteData", "mainProduct1").then((res) => {
        setProducts((prev) => {
          return [...prev, res.mainProduct1];
        });
      });
      GETDOC("websiteData", "mainProduct2").then((res) => {
        setProducts((prev) => {
          return [...prev, res.mainProduct2];
        });
      });
    };
    FetchData();
  }, []);
  const ELements = Products.map((element, index) => {
    const rating1 = element ? Math.ceil(element.rating) : "";
    return (
      <div className="productReview">
        {element ? (
          <>
            <h4>{element.title}</h4>
            <Carousel
              id={index === 0 ? "one" : index === 1 ? "two" : ""}
              images={element.images}
            />
            <div
              onClick={() => {
                window.location.href = `/product/${element.id}`;
              }}
              style={{ cursor: "pointer" }}
            >
              <p className="description">{element.description}</p>
              <div>
                <p className="OldPrice">{element.price}$</p>
                <span
                  style={{
                    textAlign: "center",
                    display: "block",
                    margin: "auto",
                  }}
                >
                  Now Only For:
                  <span style={{ fontWeight: "500" }}>
                    {element.price -
                      Math.round(
                        (element.price * element.discountPercentage) / 100
                      )}
                    $
                  </span>
                </span>
                <div
                  className="rating"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <img src={rating1 >= 1 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 2 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 3 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 4 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 5 ? starFilled : Star} alt="Star"></img>
                </div>
                {element.stock ? (
                  element.stock < 5 ? (
                    <p className="Stock">
                      Only{" "}
                      <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                        {element.stock}
                      </span>{" "}
                      left!
                    </p>
                  ) : (
                    <p className="Stock">In Stock</p>
                  )
                ) : (
                  <p className="Stock out">Out of stock</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>no product was selected</p>
        )}
      </div>
    );
  });
  return <div className="reviewWrapper">{ELements}</div>;
}
