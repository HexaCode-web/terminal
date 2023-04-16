import React, { useEffect } from "react";
import Delete from "../assets/delete.png";
import secureLocalStorage from "react-secure-storage";
import { GETDOC, SETDOC } from "../server";
import { v4 as uuid } from "uuid";
import loadingTransparent from "../assets/loading-13.gif";
import { CreateToast } from "../App";
export default function Cart(props) {
  const [activeUser, setActiveUser] = React.useState({});
  const [LocalCart, setLocalCart] = React.useState([]);
  const [inactive, setInactive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  let Total = 0;
  const remove = async (item) => {
    setInactive(true);
    setActiveUser((prev) => {
      return { ...prev, CartCount: prev.CartCount - 1 };
    });
    let target = LocalCart.indexOf(item);
    let data = LocalCart;
    data.splice(target, 1);
    setLocalCart(data);
    let tempData = [];
    setActiveUser((prev) => {
      return { ...prev, cart: LocalCart };
    });
    props.setUpdateCart((prev) => prev - 1);
    await GETDOC("statistics", 0).then((res) => {
      tempData = res;
    });
    tempData = {
      ...tempData,
      CartNum: tempData.CartNum > 0 ? tempData.CartNum - 1 : "",
    };
    SETDOC("statistics", 0, { ...tempData });
    setInactive(false);
  };

  const AddToHistory = async () => {
    if (!(LocalCart.length > 0)) {
      CreateToast("please add some items to the cart first", "error");
      return;
    } else {
      setInactive(true);
      let oldHistory = activeUser.history;
      let FetchedStatistics;
      await GETDOC("statistics", 0).then((res) => (FetchedStatistics = res));
      for (let index = 0; index < LocalCart.length; index++) {
        let element = LocalCart[index];
        let fetchedProduct = await GETDOC("products", element.id);
        if (fetchedProduct.stock > 0) {
          await SETDOC("products", element.id, {
            ...fetchedProduct,
            stock: fetchedProduct.stock - 1,
            Sold: fetchedProduct.Sold + 1,
          });
          let discount = (+element.price * element.discountPercentage) / 100;
          oldHistory.push(element);
          FetchedStatistics = {
            ...FetchedStatistics,
            ProductsSold: [...FetchedStatistics.ProductsSold, element],
            Net: Math.round(+FetchedStatistics.Net + +element.price),
            TotalDiscount: Math.round(
              FetchedStatistics.TotalDiscount + discount
            ),
            CartNum:
              FetchedStatistics.CartNum > 0
                ? FetchedStatistics.CartNum - 1
                : "",
          };
          FetchedStatistics = {
            ...FetchedStatistics,
            Revenue: FetchedStatistics.Net - FetchedStatistics.TotalDiscount,
          };
          await SETDOC("statistics", 0, { ...FetchedStatistics });
          const UpdatedUser = {
            ...props.activeUser,
            cart: [],
            history: oldHistory,
          };
          props.updateUser(UpdatedUser);
          setLocalCart(UpdatedUser.cart);
          props.setUpdateCart((prev) => prev - 1);
        } else {
          alert(`${element.title} Wasn't added, its out of stock`);
        }
      }
      setInactive(false);
    }
  };
  const cartItems = LocalCart.map((item, index) => {
    let ProductPrice = item.Offer
      ? item.price - (+item.price * item.discountPercentage) / 100
      : item.price;
    Total = Total + ProductPrice;
    return (
      <div
        className="ProductCart animate__animated animate__fadeInDown"
        key={uuid()}
      >
        <img alt="thumbnail" src={item.thumbnail} className="review" />
        <div className="ProductCartDetails">
          <span style={{ fontSize: "13px" }}> {item.title}</span>
          <br />
          <div className="PriceDetails">
            <span>{ProductPrice.toFixed(2)}$</span>
          </div>
        </div>
        <img
          alt="Delete"
          className="Delete"
          src={Delete}
          onClick={() => {
            remove(item);
          }}
        />
      </div>
    );
  });

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
  useEffect(() => {
    if (Object.keys(activeUser) != 0) {
      SETDOC("users", activeUser.id, {
        ...activeUser,
      });
    }
  }, [activeUser]);
  return (
    <>
      {inactive && (
        <div className="Inactive">
          {" "}
          <div className="Loading">
            <img src={loadingTransparent}></img>
          </div>
        </div>
      )}
      <div className={`CartMini`}>
        {isLoading ? (
          <div className="Loading">
            <img src={loadingTransparent}></img>
          </div>
        ) : (
          <>
            {cartItems}
            <div className="divider"></div>
            <div className="TotalWrapper">
              <p>
                Total is <br />
                <strong>{Total.toFixed(2)}$</strong>
              </p>
              <div className="Pay" onClick={AddToHistory}>
                Check out
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
