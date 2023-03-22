import React, { useEffect } from "react";
import Card from "../components/Card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile(props) {
  let WishListPrice = 0;
  let CartPrice = 0;
  let TotalSpent = 0;
  const History = props.User.history.map((product) => {
    TotalSpent += parseInt(
      Math.round(
        product.price - (product.price * product.discountPercentage) / 100
      )
    );
  });
  let greeting;
  if (new Date().getHours() < 12) greeting = "Good morning";
  else if (new Date().getHours() < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  const cartEL = props.User?.cart.map((item) => {
    CartPrice += parseInt(
      Math.round(item.price - (item.price * item.discountPercentage) / 100)
    );
    return (
      <SwiperSlide>
        <Card key={item.id} product={item} />
      </SwiperSlide>
    );
  });
  const WishListEL = props.User?.wishlist.map((wish) => {
    WishListPrice += parseInt(
      Math.round(wish.price - (wish.price * wish.discountPercentage) / 100)
    );
    return (
      <SwiperSlide>
        <Card key={wish.id} product={wish} />
      </SwiperSlide>
    );
  });
  const vals = Object.keys(props.User).map(function (key) {
    return props.User[key];
  });

  const CheckInfo = () => {
    for (let index = 0; index < vals.length; index++) {
      if (typeof vals[index] !== "boolean") {
        if (typeof vals[index] !== "object") {
          if (!vals[index]) {
            toast.warn(
              `your Profile is incomplete! go to ${
                props.User.admin ? "Admin Profile" : "settings"
              } to complete it`,
              {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              }
            );
            return;
          }
        }
      }
    }
  };
  useEffect(() => {
    CheckInfo();
  }, []);
  return (
    <div className="Profile">
      <h2 className="animate__animated animate__fadeInDown">
        {greeting}: {props.User.Fname} {props.User.Lname}
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
          Total Spent : {TotalSpent}$
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
          WishList Price : {WishListPrice}$
        </p>
        <p
          className="animate__animated animate__fadeInDown"
          style={{ animationDelay: "1.3s" }}
        >
          Cart Price : {CartPrice}$
        </p>
      </div>
    </div>
  );
}
