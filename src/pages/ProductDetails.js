import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import DB from "../DBConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, getDoc, doc } from "firebase/firestore";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";

const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);
export default function ProductDetails(props) {
  const [activeUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")) || ""
  );
  const [inactive, setInactive] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [addedNum, setAddedNum] = React.useState(0);
  const [Product, setProduct] = React.useState({});
  const [Error, setError] = React.useState(false);
  const [mainPhoto, setMainPhoto] = React.useState("");
  const [Rating, setRating] = React.useState(0);
  const [UserRated, setUserRated] = React.useState(false);
  const id = useParams().ID;
  const getProduct = async () => {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProduct(docSnap.data());
    } else {
      setError(true);
    }
  };

  const UpdateStatics = async (target, action) => {
    let tempData;
    const docSnap = await getDoc(doc(db, "statistics", "0"));
    if (docSnap.exists()) {
      tempData = docSnap.data();
    }
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
    setDoc(doc(db, "statistics", "0"), tempData);
  };
  const UpdateCart = async (item) => {
    if (!activeUser) {
      toast.error("you aren't signed in!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else {
      if (!Product.stock) {
        toast.error("Sorry! we are out of stock!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        return;
      }
      setInactive(true);
      await UpdateStatics("cart", "add");
      setAddedNum((prev) => prev + 1);
      addedNum === 0
        ? toast.success("added to the Cart!", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          })
        : toast.success(`added to the Cart ${addedNum} times`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
      activeUser.cart.push(item);
      props.setCartAmount(activeUser.cart.length);
      secureLocalStorage.setItem("activeUser", JSON.stringify(activeUser));
      props.updateUser(activeUser);
    }
    setInactive(false);
  };

  const UpdateWishList = async (item) => {
    if (!activeUser) {
      toast.error("you aren't signed in!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
        secureLocalStorage.setItem("activeUser", JSON.stringify(activeUser));
        props.updateUser(activeUser);
        toast.info("removed from wishlist", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        UpdateStatics("wish", "add");
        toast.success("added to the wishlist!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        activeUser.wishlist.push(item);
        secureLocalStorage.setItem("activeUser", JSON.stringify(activeUser));
        props.updateUser(activeUser);
      }
      setInactive(false);
    }
  };

  useEffect(() => {
    getProduct();
    props.getUser(activeUser.id).then((value) => {
      value.admin ? setIsAdmin(true) : setIsAdmin(false);
    });
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
      return (
        <SwiperSlide>
          <Card key={productItem.id} product={productItem} />
        </SwiperSlide>
      );
    } else {
      return;
    }
  });
  const SendRate = async () => {
    if (!activeUser) {
      toast.error("you aren't signed in!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await setDoc(doc(db, "products", id.toString()), NewData);
        setInactive(false);
        alert("your rating has been submitted! please reload the page");
        window.location.reload();
      } else {
        setInactive(false);
        toast.error("something went wrong", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
  };
  const photosEL = Product.images
    ? Product.images.map((photo) => {
        return (
          <button
            className={`thumb ${mainPhoto === photo ? "active" : ""}`}
            onClick={setMainImage}
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
      ) : Product.price ? (
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
                      window.location.replace(`/User/Product/${Product.id}`);
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
