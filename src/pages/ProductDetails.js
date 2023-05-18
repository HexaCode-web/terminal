import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay } from "swiper";
import "swiper/css/pagination";
import "swiper/css/autoplay";
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
import "./ProductDetails.css";
import MyModal from "../components/Modal";
import Rate from "../components/Rate";
import { GETDOC, SETDOC } from "../server";
export default function ProductDetails(props) {
  const [activeUser, setActiveUser] = React.useState({});
  const [inactive, setInactive] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [addedNum, setAddedNum] = React.useState(0);
  const [Product, setProduct] = React.useState({});
  const [Error, setError] = React.useState(false);
  const [mainPhoto, setMainPhoto] = React.useState("");
  const [Rating, setRating] = React.useState({ stars: 0, review: "" });
  const [UserRated, setUserRated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const id = useParams().ID;
  const discount1 = Product.Offer
    ? (Product.price * Product.discountPercentage) / 100
    : 0;
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const getProductAndUser = async () => {
    setIsLoading(true);
    await GETDOC("products", id).then((value) => {
      value !== "Error" ? setProduct(value) : setError(true);
    });
    JSON.parse(secureLocalStorage.getItem("activeUser"))?.admin
      ? setIsAdmin(true)
      : setIsAdmin(false);
    setIsLoading(false);
  };
  const updateUser = async (user) => {
    await SETDOC("users", activeUser.id, {
      ...user,
    });
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
  const AddtoCart = async (item) => {
    if (Object.keys(activeUser).length === 0) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      if (Product.stock <= 0) {
        CreateToast("Sorry! we are out of stock!", "error");
        return;
      }
      setInactive(true);
      setActiveUser((prev) => {
        return {
          ...prev,
          CartCount: prev.CartCount + 1,
          cart: [...prev.cart, item],
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
  };
  const UpdateWishList = async (item) => {
    if (Object.keys(activeUser).length === 0) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      console.log(item);
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
  const SendRate = async () => {
    if (Object.keys(activeUser).length === 0) {
      CreateToast("you aren't signed in!", "error");
      return;
    } else {
      let oldData;
      if (Product.UsersRated) {
        oldData = {
          ...Product,
          Stars: Product.Stars + Rating.stars,
          UsersRated: [
            ...Product.UsersRated,
            {
              Name: activeUser.Fname + " " + activeUser.Lname,
              User: activeUser.Username,
              review: Rating.review,
              Stars: Rating.stars,
            },
          ],
        };
      } else {
        oldData = {
          ...Product,
          Stars: Product.Stars + Rating.stars,
          UsersRated: [
            {
              Name: activeUser.Fname + " " + activeUser.Lname,
              User: activeUser.Username,
              review: Rating.review,
              Stars: Rating.stars,
            },
          ],
        };
      }
      const NewData = {
        ...oldData,
        rating: oldData.Stars / oldData.UsersRated.length,
      };
      try {
        await SETDOC("products", id, { ...NewData });
      } catch (error) {
        CreateToast("something went wrong", "error");
      }
    }
  };
  const setMainImage = (e) => {
    setMainPhoto(e.target.src);
  };
  const photosEL = Product.images
    ? Product.images.map((photo) => {
        return (
          <button
            className={`thumb ${mainPhoto === photo.url ? "active" : ""}`}
            onClick={setMainImage}
            key={uid()}
          >
            <img src={photo.url} />
          </button>
        );
      })
    : "";
  const handlePrimaryAction = async () => {
    await SendRate();
    await getProductAndUser();
    handleCloseModal();
  };

  useEffect(() => {
    if (JSON.parse(secureLocalStorage.getItem("activeUser"))) {
      GETDOC(
        "users",
        JSON.parse(secureLocalStorage.getItem("activeUser")).id
      ).then((res) => {
        setActiveUser(res);
      });
    }
  }, [props.UpdateCart]);
  useEffect(() => {
    if (Object.keys(activeUser).length !== 0) {
      updateUser(activeUser);
    }
  }, [activeUser]);

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
            if (user.User === activeUser.Username) {
              return setUserRated(true);
            }
          })
        : ""
      : "";
  }, [Product]);

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

  const Rates = Product.UsersRated?.map((rate) => {
    return (
      <SwiperSlide key={uid()}>
        <Rate rate={rate} />
      </SwiperSlide>
    );
  });
  useEffect(() => {
    const mainImg = document.querySelector(".mainIMG");
    if (mainImg) {
      mainImg.classList.add("animate__animated", "animate__backInDown");
      const animationEndHandler = () => {
        mainImg.classList.remove("animate__animated", "animate__backInDown");
      };
      mainImg.addEventListener("animationend", animationEndHandler);
      return () => {
        mainImg.removeEventListener("animationend", animationEndHandler);
      };
    }
  }, [mainPhoto]);
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
              <div className="MainIMG-wrapper">
                <img className="mainIMG" src={mainPhoto ? mainPhoto : ""} />
              </div>
              <div className="ThumbPhotos">{photosEL}</div>
            </div>
            <div className="right">
              <h1 className="Product animate__animated animate__fadeInRightBig">
                {Product.title}
              </h1>
              <div className="Rating-wrapper animate__animated animate__fadeInRightBig">
                <div className="ratingOuter">
                  <img src={Product.rating >= 1 ? starFilled : Star}></img>
                  <img src={Product.rating >= 2 ? starFilled : Star}></img>
                  <img src={Product.rating >= 3 ? starFilled : Star}></img>
                  <img src={Product.rating >= 4 ? starFilled : Star}></img>
                  <img src={Product.rating >= 5 ? starFilled : Star}></img>
                </div>
                <span>
                  ( {Product.UsersRated ? Product.UsersRated.length : 0} users )
                </span>
              </div>
              <p className="Overview animate__animated animate__fadeInRightBig">
                {Product.description}
              </p>
              <div className="Sold-wrapper animate__animated animate__fadeInRightBig">
                <div>{Product.Sold} users bought this</div>
              </div>
              {!UserRated && !isAdmin ? (
                <button
                  className="Rate cart animate__animated animate__backInUp"
                  onClick={handleShowModal}
                >
                  Rate Product
                </button>
              ) : (
                ""
              )}
              <div className="Price-Stock-wrapper  animate__animated animate__fadeInRightBig">
                $ {""}
                <span className="Price">
                  {(Product.price - discount1).toFixed(2)}
                </span>
                {Product.stock > 0 ? (
                  Product.stock < 5 ? (
                    <p className="Stock">
                      Only <span>{Product.stock}</span> left!
                    </p>
                  ) : (
                    <p className="Stock">In Stock</p>
                  )
                ) : (
                  <p className="Stock out">Out of stock</p>
                )}
              </div>
              {Product.Offer && (
                <p className="OldPrice  animate__animated animate__fadeInRightBig ">
                  {Product.price}
                </p>
              )}
              <div className="buttons">
                {isAdmin ? (
                  <button
                    className={`cart ${Product.stock ? "" : "button-inactive"}`}
                    onClick={() => {
                      window.location.href = `/Dashboard/Product/${Product.id}`;
                    }}
                  >
                    Edit Product / Add Stock
                  </button>
                ) : (
                  <>
                    <img
                      className="Wish animate__animated animate__bounceIn"
                      src={
                        Object.keys(activeUser).length !== 0
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
                      className={`cart animate__animated animate__bounceIn ${
                        Product.stock > 0 ? "" : "button-inactive"
                      }`}
                      onClick={() => {
                        AddtoCart(Product);
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
          <div className="UserRates">
            <h3>What do the users have to say about this product?</h3>
            <div style={{ width: "100%" }}>
              {Product.UsersRated.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  freeMode={true}
                  loop={true}
                  slidesPerView={1}
                  pagination={{
                    clickable: true,
                  }}
                  className="mySwiper"
                >
                  {Rates}
                </Swiper>
              ) : (
                <h4 style={{ textAlign: "center", margin: "20px" }}>
                  No Rates yet! check back later or be the first!
                </h4>
              )}
            </div>
          </div>
          <h2> Similar Products</h2>
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
          <MyModal
            className="RateModalWrapper"
            show={showModal}
            handleClose={handleCloseModal}
            title={`Rate ${Product.title}`}
            primaryButtonText="Rate"
            handlePrimaryAction={handlePrimaryAction}
          >
            <>
              <div className="rating">
                <img
                  className="img"
                  src={Rating.stars >= 1 ? starFilled : StarB}
                  onClick={() => {
                    setRating((prev) => {
                      return { ...prev, stars: 1 };
                    });
                  }}
                ></img>
                <img
                  className="img"
                  src={Rating.stars >= 2 ? starFilled : StarB}
                  onClick={() => {
                    setRating((prev) => {
                      return { ...prev, stars: 2 };
                    });
                  }}
                ></img>
                <img
                  className="img"
                  src={Rating.stars >= 3 ? starFilled : StarB}
                  onClick={() => {
                    setRating((prev) => {
                      return { ...prev, stars: 3 };
                    });
                  }}
                ></img>
                <img
                  className="img"
                  src={Rating.stars >= 4 ? starFilled : StarB}
                  onClick={() => {
                    setRating((prev) => {
                      return { ...prev, stars: 4 };
                    });
                  }}
                ></img>
                <img
                  className="img"
                  src={Rating.stars >= 5 ? starFilled : StarB}
                  onClick={() => {
                    setRating((prev) => {
                      return { ...prev, stars: 5 };
                    });
                  }}
                ></img>
              </div>
              <div className="formItem">
                <label htmlFor="Review">
                  Say an honest thing about the product:(optional)
                </label>
                <textarea
                  id="Review"
                  value={Rating.review}
                  onChange={(e) => {
                    setRating((prev) => {
                      return {
                        ...prev,
                        review: e.target.value,
                      };
                    });
                  }}
                ></textarea>
              </div>
            </>
          </MyModal>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
