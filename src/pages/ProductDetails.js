import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import Card from "../components/Card";
import cart from "../assets/cart-hover.png";
import wish from "../assets/heart.png";
import wished from "../assets/heart-hover.png";
import Error404 from "./Error404";
import Star from "../assets/star-empty.png";
import StarB from "../assets/star-black.png";
import starFilled from "../assets/star-filled.png";
import loading from "../assets/loading-13.gif";
import { v4 as uid } from "uuid";
import secureLocalStorage from "react-secure-storage";
import { CreateToast } from "../App";
import { GETDOC, SETDOC } from "../server";
export default function ProductDetails(props) {
  const [activeUser, setActiveUser] = React.useState({});
  const [inactive, setInactive] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [addedNum, setAddedNum] = React.useState(0);
  const [Product, setProduct] = React.useState({});
  const [Error, setError] = React.useState(false);
  const [mainPhoto, setMainPhoto] = React.useState("");
  const [Rating, setRating] = React.useState(0);
  const [UserRated, setUserRated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const id = useParams().ID;

  const getProductAndUser = async () => {
    setIsLoading(true);
    await GETDOC("products", id).then((value) => {
      value !== "Error" ? setProduct(value) : setError(true);
    });
    JSON.parse(secureLocalStorage.getItem("activeUser")).admin
      ? setIsAdmin(true)
      : setIsAdmin(false);
    setIsLoading(false);
  };
  const UpdateStatics = async (target, action) => {
    let tempData;
    await GETDOC("statistics", "0").then((value) => {
      value ? (tempData = value) : "";
    });
    if (target === "wish" && action === "add") {
      tempData = { ...tempData, WishNum: tempData.WishNum + 1 };
    }
    if (target === "wish" && action === "remove") {
      tempData = { ...tempData, WishNum: tempData.WishNum - 1 };
    }
    if (target === "cart" && action === "add") {
      tempData = { ...tempData, CartNum: tempData.CartNum + 1 };
    }
    if (target === "cart" && action === "remove") {
      tempData = { ...tempData, CartNum: tempData.CartNum - 1 };
    }
    await SETDOC("statistics", "0", tempData);
  };
  const UpdateCart = async (item) => {
    const Price = item.Offer
      ? item.price - (item.price * item.discountPercentage) / 100
      : item.price;
    if (!activeUser) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      if (!Product.stock) {
        CreateToast("Sorry! we are out of stock!", "error");
        return;
      }
      setInactive(true);
      props.setShowCart(false);
      let newAR = activeUser.cart;
      newAR.push(item);
      setActiveUser((prev) => {
        return {
          ...prev,
          CartCount: prev.CartCount + 1,
          cart: newAR,
        };
      });
      await UpdateStatics("cart", "add");
      setAddedNum((prev) => prev + 1);
      addedNum === 0
        ? CreateToast("added to the Cart!", "success")
        : CreateToast(`added to the Cart ${addedNum + 1} times`, "success");
    }
    props.setUpdateCart((prev) => prev + 1);
    setInactive(false);
    props.setShowCart(true);
  };
  const UpdateWishList = async (item) => {
    if (!activeUser) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      setInactive(true);
      let targetProductPlace;
      activeUser.wishlist.find((wish, index) => {
        if (wish.title === Product.title) {
          targetProductPlace = index;
        }
      });
      if (
        activeUser.wishlist.find((wish) => {
          return wish.title === Product.title;
        })
      ) {
        await UpdateStatics("wish", "remove");
        activeUser.wishlist.splice(targetProductPlace, 1);

        props.updateUser(activeUser);
        CreateToast("removed from wishlist", "info");
      } else {
        UpdateStatics("wish", "add");
        CreateToast("added to the wishlist!", "success");
        activeUser.wishlist.push(item);
        props.updateUser(activeUser);
      }
      setInactive(false);
    }
  };
  useEffect(() => {
    if (Object.keys(activeUser) != 0) {
      SETDOC("users", activeUser.id, {
        ...activeUser,
      });
    }
  }, [activeUser]);
  useEffect(() => {
    GETDOC(
      "users",
      JSON.parse(secureLocalStorage.getItem("activeUser")).id
    ).then((res) => {
      setActiveUser(res);
    });
  }, [props.UpdateCart]);
  useEffect(() => {
    getProductAndUser();
  }, []);
  useEffect(() => {
    setMainPhoto(Product.images ? Product.images[0].url : "");
  }, [Product]);
  useEffect(() => {
    activeUser
      ? Product.UsersRated
        ? Product.UsersRated.find((user) => {
            if (user === activeUser.Username) {
              return setUserRated(true);
            }
          })
        : ""
      : "";
  }, [Product]);
  const setMainImage = (e) => {
    setMainPhoto(e.target.src);
  };
  const NewProducts = props.Items.map((productItem) => {
    if (productItem.category === Product.category) {
      if (productItem.title === Product.title) {
        return;
      } else {
        return (
          <SwiperSlide key={uid()}>
            <Card product={productItem} />
          </SwiperSlide>
        );
      }
    } else {
      return;
    }
  });
  const SendRate = async () => {
    if (!activeUser) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      setInactive(true);
      let oldData;
      if (Product.UsersRated) {
        oldData = {
          ...Product,
          Stars: Product.Stars + Rating,
          UsersRated: [...Product.UsersRated, activeUser.Username],
        };
      } else {
        oldData = {
          ...Product,
          Stars: Product.Stars + Rating,
          UsersRated: [activeUser.Username],
        };
      }
      const NewData = {
        ...oldData,
        rating: oldData.Stars / oldData.UsersRated.length,
      };
      try {
        await SETDOC("products", id, { ...NewData });
        CreateToast("your changes have been saved", "success");
        window.location.reload();
        setInactive(false);
      } catch (error) {
        CreateToast("something went wrong", "error");
        setInactive(false);
      }
    }
  };
  const photosEL = Product.images
    ? Product.images.map((photo) => {
        return (
          <button
            className={`thumb ${mainPhoto === photo ? "active" : ""}`}
            onClick={setMainImage}
            key={uid()}
          >
            <img src={photo.url} />
          </button>
        );
      })
    : "";
  const discount1 = Product.Offer
    ? (Product.price * Product.discountPercentage) / 100
    : 0;
  return (
    <>
      {inactive && (
        <div className="Inactive">
          <img src={loading} />
        </div>
      )}
      {Error ? (
        <Error404 />
      ) : !isLoading ? (
        <div>
          <div className="Details">
            <div className="left">
              <div
                style={{
                  minHeight: "600px",
                  minWidth: "500px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img className="mainIMG" src={mainPhoto ? mainPhoto : ""} />
              </div>
              <div className="ThumbPhotos">{photosEL}</div>
            </div>
            <div className="right">
              <h1 className="Product">{Product.title}</h1>
              <p className="Overview">{Product.description}</p>
              <div className="rating" style={{ justifyContent: "flex-start" }}>
                <img
                  src={Product.rating >= 1 ? starFilled : Star}
                  style={{ scale: "1.5" }}
                ></img>
                <img
                  src={Product.rating >= 2 ? starFilled : Star}
                  style={{ scale: "1.5", margin: "5px" }}
                ></img>
                <img
                  src={Product.rating >= 3 ? starFilled : Star}
                  style={{ scale: "1.5", margin: "5px" }}
                ></img>
                <img
                  src={Product.rating >= 4 ? starFilled : Star}
                  style={{ scale: "1.5", margin: "5px" }}
                ></img>
                <img
                  src={Product.rating >= 5 ? starFilled : Star}
                  style={{ scale: "1.5", margin: "5px" }}
                ></img>
              </div>{" "}
              <span style={{ margin: "10px 0", display: "block" }}>
                {Product.UsersRated ? Product.UsersRated.length : 0} Users Rated{" "}
              </span>
              {!UserRated && !isAdmin ? (
                <button
                  type="button"
                  className="Rate cart"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  Rate Product
                </button>
              ) : (
                ""
              )}
              <div>
                $ {""}
                <span className="Price">
                  {Math.round(Product.price - discount1)}
                </span>
              </div>
              {Product.Offer && <p className="OldPrice">{Product.price}</p>}
              {Product.stock ? (
                Product.stock < 5 ? (
                  <p className="Stock">
                    Only{" "}
                    <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                      {Product.stock}
                    </span>{" "}
                    left!
                  </p>
                ) : (
                  <p className="Stock">In Stock</p>
                )
              ) : (
                <p className="Stock out">Out of stock</p>
              )}
              <div className="buttons">
                {isAdmin ? (
                  <button
                    className={`cart ${Product.stock ? "" : "button-inactive"}`}
                    onClick={() => {
                      window.location.replace(
                        `/Dashboard/Product/${Product.id}`
                      );
                    }}
                  >
                    Edit Product / Add Stock
                  </button>
                ) : (
                  <>
                    <img
                      className="Wish"
                      src={
                        activeUser
                          ? activeUser.wishlist.find((item) => {
                              return item.title === Product.title;
                            })
                            ? wished
                            : wish
                          : wish
                      }
                      onClick={() => {
                        UpdateWishList(Product);
                      }}
                    />
                    <button
                      className={`cart ${
                        Product.stock ? "" : "button-inactive"
                      }`}
                      onClick={() => {
                        UpdateCart(Product);
                      }}
                    >
                      <img src={cart} />
                      Add to cart
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <h2 style={{ margin: "20px" }}> Similar Products</h2>
          <Swiper
            freeMode={true}
            slidesPerView={5}
            spaceBetween={10}
            pagination={{
              clickable: true,
            }}
            modules={[Pagination]}
            className="mySwiper"
          >
            {NewProducts}
          </Swiper>
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5" style={{ color: "black" }}>
                    Rate {Product.title}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="rating">
                    <img
                      src={Rating >= 1 ? starFilled : StarB}
                      style={{ scale: "2", margin: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setRating(1);
                      }}
                    ></img>
                    <img
                      src={Rating >= 2 ? starFilled : StarB}
                      style={{ scale: "2", margin: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setRating(2);
                      }}
                    ></img>
                    <img
                      src={Rating >= 3 ? starFilled : StarB}
                      style={{ scale: "2", margin: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setRating(3);
                      }}
                    ></img>
                    <img
                      src={Rating >= 4 ? starFilled : StarB}
                      style={{ scale: "2", margin: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setRating(4);
                      }}
                    ></img>
                    <img
                      src={Rating >= 5 ? starFilled : StarB}
                      style={{ scale: "2", margin: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setRating(5);
                      }}
                    ></img>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={SendRate}
                  >
                    Rate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
