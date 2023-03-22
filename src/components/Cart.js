import React from "react";
import Delete from "../assets/delete.png";
import { initializeApp } from "firebase/app";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import DB from "../DBConfig.json";
import secureLocalStorage from "react-secure-storage";
const app = initializeApp(DB.firebaseConfig);
const db = getFirestore(app);

export default function Cart(props) {
  const [LocalCart, setCart] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser")).cart
  );
  const [inactive, setInactive] = React.useState(false);
  let Total = 0;
  const remove = async (place) => {
    setInactive(true);
    let tempData;
    const docSnap = await getDoc(doc(db, "statistics", "0"));
    if (docSnap.exists()) {
      tempData = docSnap.data();
    }
    tempData = { ...tempData, CartNum: tempData.CartNum - 1 };
    setDoc(doc(db, "statistics", "0"), tempData);
    LocalCart.splice(place, 1);
    props.setActiveUser((prev) => {
      return { ...prev, cart: LocalCart };
    });
    secureLocalStorage.setItem("activeUser", JSON.stringify(props.activeUser));
    props.updateUser(props.activeUser);
    props.setCartAmount(LocalCart.length);
    setInactive(false);
  };

  const AddToHistory = async () => {
    if (LocalCart.length > 0) {
      setInactive(true);
      const oldHistory = JSON.parse(
        secureLocalStorage.getItem("activeUser")
      ).history;
      let tempData;
      const docSnap = await getDoc(doc(db, "statistics", "0"));
      if (docSnap.exists()) {
        tempData = docSnap.data();
      }
      for (let index = 0; index < LocalCart.length; index++) {
        let element = LocalCart[index];

        let docSnap = await getDoc(doc(db, "products", element.id.toString()));
        if (docSnap.data().stock > 0) {
          await setDoc(doc(db, "products", element.id.toString()), {
            ...docSnap.data(),
            stock: +docSnap.data().stock - 1,
          });
          let discount = (+element.price * element.discountPercentage) / 100;
          oldHistory.push(element);
          tempData = {
            ...tempData,
            ProductsSold: [...tempData.ProductsSold, element],
            Net: Math.round(+tempData.Net + +element.price),
            TotalDiscount: Math.round(tempData.TotalDiscount + discount),
            CartNum: tempData.CartNum - LocalCart.length,
          };
          tempData = {
            ...tempData,
            Revenue: tempData.Net - tempData.TotalDiscount,
          };
          await setDoc(doc(db, "statistics", "0"), tempData);
          const UpdatedUser = {
            ...props.activeUser,
            cart: [],
            history: oldHistory,
          };
          secureLocalStorage.setItem("activeUser", JSON.stringify(UpdatedUser));
          setCart([]);
          props.updateUser(UpdatedUser);
        } else {
          alert(`${element.title} Wasn't added, its out of stock`);
        }
      }
      setInactive(false);
    } else {
      return;
    }
  };

  const cartItems = LocalCart.map((item, index) => {
    Total += parseInt(
      Math.round(item.price - (item.price * item.discountPercentage) / 100)
    );
    return (
      <div className="ProductCart animate__animated animate__fadeInDown">
        <img alt="thumbnail" src={item.thumbnail} className="review" />
        <div className="ProductCartDetails">
          <span style={{ fontSize: "13px" }}> {item.title}</span>
          <br />
          <span>
            {Math.round(
              item.price - (item.price * item.discountPercentage) / 100
            )}
            $
          </span>
        </div>
        <img
          alt="Delete"
          className="Delete"
          src={Delete}
          onClick={() => {
            remove(index);
          }}
        />
      </div>
    );
  });

  return (
    <>
      {inactive && <div className="Inactive"></div>}
      <div className={`CartMini`}>
        {cartItems}
        <div className="divider"></div>
        <div className="TotalWrapper">
          <p>
            Total is <br />
            <strong>{Total}$</strong>
          </p>
          <div className="Pay" onClick={AddToHistory}>
            Check out
          </div>
        </div>
      </div>
    </>
  );
}
