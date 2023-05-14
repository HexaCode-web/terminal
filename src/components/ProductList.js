/* eslint-disable array-callback-return */
import React, { useEffect } from "react";
import Card from "./Card";
import { useParams } from "react-router-dom";
import "./ProductList.css";
export default function ProductList(props) {
  console.log(props);
  const id = useParams().ID;
  const Target = props.List.find((category) => {
    if (category.Name == id) {
      return category;
    }
  });
  const [categoryData, setCategoryData] = React.useState(Target.products);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredData, setFilteredData] = React.useState([]);
  useEffect(() => {
    setCategoryData(Target.products);
  }, [Target]);
  const brandList = [
    ...new Set(
      categoryData.map((product) => {
        return product.brand;
      })
    ),
  ];

  const SortBrand = (brand) => {
    if (brand === "All") {
      setCategoryData(Target.products);
      return;
    }
    setCategoryData(
      categoryData.filter((product) => {
        if (product.brand.toLowerCase() === brand.toLowerCase()) {
          return product;
        }
      })
    );
  };
  const Search = (event) => {
    setSearchTerm(event.target.value);
    setFilteredData(
      categoryData.filter((product) => {
        if (searchTerm === "") {
          return product;
        } else if (
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return product;
        }
      })
    );
  };

  return (
    <>
      {categoryData ? (
        <div
          className="Content"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            gap: "0px",
          }}
        >
          <div className="search-wrapper animate animate__animated animate__fadeInDown">
            <input
              required
              type="text"
              className="search"
              name="search"
              onChange={Search}
            />
            <span className="item itemFour"></span>
          </div>
          <ul className="Brands">
            <p
              className="brandBTN"
              onClick={() => {
                SortBrand("All");
              }}
            >
              All
            </p>
            {brandList.map((brand) => {
              return (
                <p
                  className="brandBTN"
                  onClick={() => {
                    SortBrand(brand);
                  }}
                >
                  {brand}
                </p>
              );
            })}
          </ul>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {searchTerm
              ? filteredData.map((product) => {
                  return <Card key={product.id} product={product} />;
                })
              : categoryData.map((product) => {
                  return <Card key={product.id} product={product} />;
                })}
          </div>
        </div>
      ) : (
        <h1> Whoops! no products were found! try changing your words!</h1>
      )}
    </>
  );
}
