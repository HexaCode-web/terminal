import React, { useEffect } from "react";
import date from "date-and-time";
import secureLocalStorage from "react-secure-storage";
import { GETDOC, SETDOC } from "../../server";
import { v4 as uuid } from "uuid";
import loadingTransparent from "../../assets/loading-13.gif";
import removeBtn from "../../assets/001-minus.png";
import removeBtnDark from "../../assets/001-minus dark.png";
import addBtn from "../../assets/002-plus.png";
import addBtnDark from "../../assets/002-plus dark.png";
import Empty from "../../assets/empty-cart.png";
import "./Cart.css";
import { CreateToast } from "../../App";
export default function Cart(props) {
  const [activeUser, setActiveUser] = React.useState({});
  const [LocalCart, setLocalCart] = React.useState([]);
  const [sortedCart, setSortedCart] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showSideMenu, setShowSideMenu] = React.useState(false);
  const [Total, setTotal] = React.useState(0);
  const pattern = date.compile("HH:mm ddd, MMM DD YYYY");
  function generateId() {
    const randomNumber = Math.floor(Math.random() * 100000000);
    const id = randomNumber.toString().padStart(8, "0");
    return id;
  }
  const AddToPending = async () => {
    if (LocalCart.length === 0) {
      CreateToast("Please add some items to the cart first", "error");
      return;
    }
    let PendingOrdersUSER = activeUser.pending;
    let FetchedUser = await GETDOC("users", activeUser.id);
    for (const element of LocalCart) {
      const now = new Date();
      const fetchedStatistics = await GETDOC("statistics", 0);
      const fetchedProduct = await GETDOC("products", element.id);
      const Order = {
        product: element.id,
        user: activeUser.id,
        ID: generateId(),
        CreatedAt: date.format(now, pattern),
      };
      if (fetchedProduct.stock > 0) {
        PendingOrdersUSER = [...PendingOrdersUSER, Order];
        const updatedUser = {
          ...FetchedUser,
          cart: [],
          pending: PendingOrdersUSER,
        };
        fetchedStatistics.PendingOrders.push(Order);
        const updatedStatistics = {
          ...fetchedStatistics,
          CartNum: fetchedStatistics.CartNum - 1,
        };
        await SETDOC("statistics", 0, updatedStatistics);
        setActiveUser(updatedUser);
        setLocalCart(updatedUser.cart);
        props.setUpdateCart((prev) => prev - 1);
        CreateToast(
          `${element.title} Added to pending orders, we will let you know when its confirmed!`,
          "success"
        );
      } else {
        CreateToast(
          `${element.title} wasn't added, it's out of stock`,
          "error"
        );
      }
    }
  };

  const CheckInfo = (res) => {
    const vals = Object.keys(res).map(function (key) {
      return res[key];
    });
    for (let index = 0; index < vals.length; index++) {
      if (typeof vals[index] !== "boolean") {
        if (typeof vals[index] !== "object")
          if (vals[index] !== 0) {
            if (!vals[index]) {
              return true;
            }
          }
      }
    }
  };
  const Choice = async (userChoice) => {
    let fetchedData;
    if (userChoice === "online") {
      CreateToast("coming soon!", "info");
    }
    if (userChoice === "cash") {
      await GETDOC("users", activeUser.id).then((res) => {
        fetchedData = res;
        setActiveUser(res);
      });
      if (CheckInfo(fetchedData)) {
        CreateToast(
          `your Profile is incomplete! go to ${
            fetchedData.admin ? "Admin Profile" : "settings"
          } to complete it`,
          "error"
        );
      } else {
        setIsLoading(true);
        setShowSideMenu(false);
        await AddToPending();
        setIsLoading(false);
      }
    }
  };
  const cartSorter = () => {
    let NewAr = [];
    setTotal(0);
    LocalCart.forEach((product) => {
      const price = product.Offer
        ? product.price - (product.price * product.discountPercentage) / 100
        : product.price;
      setTotal((prev) => prev + price);
      let productFound = false;
      for (let i = 0; i < NewAr.length; i++) {
        if (NewAr[i].product.id === product.id) {
          NewAr[i].quantity++;
          NewAr[i].price += price;
          productFound = true;
          break;
        }
      }
      if (!productFound) {
        NewAr.push({ product, quantity: 1, price: price });
      }
    });
    return NewAr;
  };
  useEffect(() => {
    const updateCart = async () => {
      setIsLoading(true);
      setSortedCart(cartSorter());
      if (activeUser.id) {
        await SETDOC("users", activeUser.id, {
          ...activeUser,
          cart: LocalCart,
          CartCount: LocalCart.length,
        });
        props.setUpdateCart(LocalCart.length);
      }
      setIsLoading(false);
    };
    updateCart();
  }, [LocalCart]);

  const increase = (id) => {
    let target = LocalCart.find((product) => {
      return product.id === id;
    });
    setLocalCart((prev) => {
      return [...prev, target];
    });
  };
  const decrease = async (id) => {
    setLocalCart((prevCart) => {
      const newCart = [...prevCart];
      const targetIndex = newCart.findIndex((product) => product.id === id);
      if (targetIndex !== -1) {
        newCart.splice(targetIndex, 1);
      }
      return newCart;
    });
    const fetchedStatistics = await GETDOC("statistics", 0);
    const updatedStatistics = {
      ...fetchedStatistics,
      CartNum: Math.max(0, fetchedStatistics.CartNum - 1),
    };
    await SETDOC("statistics", 0, updatedStatistics);
    props.setUpdateCart(LocalCart.length);
  };
  useEffect(() => {
    GETDOC(
      "users",
      JSON.parse(secureLocalStorage.getItem("activeUser")).id
    ).then((res) => {
      setLocalCart(res.cart);
      setActiveUser(res);
      setIsLoading(false);
    });
  }, []);
  return (
    <div className="Cart container">
      {isLoading && (
        <div className="overlay">
          <img src={loadingTransparent}></img>
        </div>
      )}
      <h1 className="animate__animated animate__fadeInDown">
        your Shopping Cart
      </h1>
      <div className="CartList animate__animated animate__fadeInDown">
        {sortedCart.length > 0 ? (
          sortedCart.map((productWrapper) => {
            return (
              <div className={`CartItem`} key={uuid()}>
                <img
                  className="Thumbnail"
                  src={productWrapper.product.thumbnail}
                ></img>
                <p>{productWrapper.product.title}</p>
                <div className="Buttons">
                  <div className="button-wrapper">
                    <button
                      onClick={() => {
                        increase(productWrapper.product.id);
                      }}
                    >
                      <img
                        src={
                          JSON.parse(localStorage.getItem("darkMode"))
                            ? addBtnDark
                            : addBtn
                        }
                      ></img>
                    </button>
                    <button
                      onClick={() => {
                        decrease(productWrapper.product.id);
                      }}
                    >
                      <img
                        src={
                          JSON.parse(localStorage.getItem("darkMode"))
                            ? removeBtnDark
                            : removeBtn
                        }
                      ></img>
                    </button>
                  </div>
                  <p>{productWrapper.quantity}</p>
                </div>
                <p>{productWrapper.price}$</p>
              </div>
            );
          })
        ) : (
          <div className="EmptyCart">
            <img src={Empty}></img>
            <h2>your cart is empty :( </h2>
            <h6>Go shop some more or view your pending orders!</h6>
            <div className="button-wrapper" style={{ maxWidth: "50%" }}>
              <button
                className="button"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Go back to shopping
              </button>
              <button
                className="button"
                onClick={() => {
                  window.location.href = "/User/Pending";
                }}
              >
                view your pending list
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`SideMenuButton  ${
          showSideMenu ? "ShowSideMenuButton" : ""
        }`}
        onClick={() => {
          setShowSideMenu((prev) => !prev);
        }}
      >
        Checkout
      </div>
      <div className={`SideMenu ${showSideMenu ? "ShowSideMenu" : ""}`}>
        <div className="pricing">
          <div className="fieldWrapper">
            <h6>Subtotal is : </h6>
            <h6>{Total.toFixed(2)}$</h6>
          </div>
          <div className="fieldWrapper">
            <h6>Shipping:</h6>
            <h6>FREE $</h6>
          </div>
          <div className="fieldWrapper">
            <h6>Total:</h6>
            <h6>{Total.toFixed(2)}$</h6>
          </div>
        </div>
        <h4>Select payment method</h4>
        <div className="button-wrapper">
          <button
            className="SideMenuButton"
            onClick={() => {
              Choice("cash");
            }}
          >
            Cash on delivery
          </button>
          <button
            className="SideMenuButton"
            onClick={() => {
              Choice("online");
            }}
          >
            online
          </button>
        </div>
      </div>
      {showSideMenu && (
        <>
          <div className="overlay Below"></div>
        </>
      )}
    </div>
  );
}
/*    

  const updatedProduct = {
        ...fetchedProduct,
        stock: fetchedProduct.stock - 1,
        Sold: fetchedProduct.Sold + 1,
      };
      await SETDOC("products", element.id, updatedProduct);
      const discount = (+element.price * element.discountPercentage) / 100;
      PendingOrders.push(element);
      const updatedStatistics = {
        ...fetchedStatistics,
        ProductsSold: [...fetchedStatistics.ProductsSold, element],
        Net: Math.round(+fetchedStatistics.Net + +element.price),
        TotalDiscount: Math.round(fetchedStatistics.TotalDiscount + discount),
        CartNum: Math.max(0, fetchedStatistics.CartNum - 1),
        Revenue:
          fetchedStatistics.Net -
          fetchedStatistics.TotalDiscount +
          element.price,
      };
      await SETDOC("statistics", 0, updatedStatistics); 
      */
