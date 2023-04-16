import React, { useEffect } from "react";
import Card from "../components/Card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import "react-toastify/dist/ReactToastify.css";
import { CreateToast } from "../App";
import { v4 as uuid } from "uuid";
import { GETDOC } from "../server";
import secureLocalStorage from "react-secure-storage";
export default function Profile() {
  const [activeUser, setActiveUser] = React.useState(
    JSON.parse(secureLocalStorage.getItem("activeUser"))
  );
  let WishListPrice = 0;
  let CartPrice = 0;
  let TotalSpent = 0;
  const History = activeUser.history?.map((product) => {
    TotalSpent += parseInt(
      product.price - (product.price * product.discountPercentage) / 100
    );
  });
  let greeting;
  if (new Date().getHours() < 12) greeting = "Good morning";
  else if (new Date().getHours() < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  const cartEL = activeUser.cart?.map((item) => {
    CartPrice += parseInt(
      item.price - (item.price * item.discountPercentage) / 100
    );
    return (
      <SwiperSlide key={uuid()}>
        <Card product={item} />
      </SwiperSlide>
    );
  });
  const WishListEL = activeUser.wishlist?.map((wish) => {
    WishListPrice += parseInt(
      wish.price - (wish.price * wish.discountPercentage) / 100
    );
    return (
      <SwiperSlide key={uuid()}>
        <Card product={wish} />
      </SwiperSlide>
    );
  });

  const FetchUser = async (id) => {
    await GETDOC("users", id).then((res) => {
      setActiveUser(res);
    });
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
              CreateToast(
                `your Profile is incomplete! go to ${
                  res.admin ? "Admin Profile" : "settings"
                } to complete it`,
                "warn"
              );
              return;
            }
          }
      }
    }
  };
  useEffect(() => {
    const checkData = async () => {
      let fetchedData = {};
      GETDOC("users", activeUser.id).then((res) => {
        fetchedData = res;
        setActiveUser(res);
        CheckInfo(fetchedData);
      });
    };
    checkData();
  }, []);

  return (
    <div className="Profile">
      <h2 className="animate__animated animate__fadeInDown">
        {greeting}: {activeUser.Fname} {activeUser.Lname}
      </h2>
      <div className="Card-wrapper">
        <div className="Card Cart animate__animated animate__backInDown">
          <h3 style={{ textAlign: "center", margin: "20px" }}>Your Cart</h3>
          {cartEL.length > 0 ? (
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
              {cartEL}
            </Swiper>
          ) : (
            <h3 className="MSG">Your Cart is empty ! go shop some more!</h3>
          )}
        </div>
        <div className="Card wishList animate__animated animate__backInUp">
          <h3 style={{ textAlign: "center", margin: "20px" }}>Your WishList</h3>
          {WishListEL.length > 0 ? (
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
              {WishListEL}
            </Swiper>
          ) : (
            <h3 className="MSG">You don't have any wishes yet!</h3>
          )}
        </div>
      </div>
      <div className="Statics animate__animated animate__backInRight">
        <p
          className="animate__animated animate__fadeInDown"
          style={{ animationDelay: "1s" }}
        >
          Total Spent : {TotalSpent.toFixed(2)}$
        </p>
        <p
          className="animate__animated animate__fadeInDown"
          style={{ animationDelay: "1.1s" }}
        >
          Total items Bought : {History.length}
        </p>
        <p
          className="animate__animated animate__fadeInDown"
          style={{ animationDelay: "1.2s" }}
        >
          WishList Price : {WishListPrice.toFixed(2)}$
        </p>
        <p
          className="animate__animated animate__fadeInDown"
          style={{ animationDelay: "1.3s" }}
        >
          Cart Price : {CartPrice.toFixed(2)}$
        </p>
      </div>
    </div>
  );
}
