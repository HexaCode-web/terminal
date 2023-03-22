import React, { useEffect } from "react";
import Card from "../components/Card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import Star from "../assets/star-empty.png";
import starFilled from "../assets/star-filled.png";
import Carousel from "../components/carosuel";
import AppleBanner from "../assets/appleBanner.jpg";
import sortBy from "sort-by";
export default function Content(props) {
  const Data = props.List;
  const SamsungList = [];
  const AppleList = [];
  Data.sort(sortBy("id"));
  Data.forEach((product) => {
    if (product.brand === "Samsung") {
      SamsungList.push(product);
    }
    if (product.brand === "Apple") {
      AppleList.push(product);
    }
  });
  const reviewProduct1 = SamsungList[1];
  const reviewProduct2 = SamsungList[0];

  const rating1 = reviewProduct1 ? Math.ceil(reviewProduct1.rating) : "";
  const discount1 = reviewProduct1
    ? (reviewProduct1.price * reviewProduct1.discountPercentage) / 100
    : "";

  const NewProducts = Data.slice(0, 4).map((product) => {
    return (
      <SwiperSlide>
        <Card key={product.id} product={product} />
      </SwiperSlide>
    );
  });
  const AppleListEL = AppleList.map((product) => {
    return (
      <SwiperSlide>
        <Card key={product.id} product={product} />
      </SwiperSlide>
    );
  });
  const HotProducts = Data.map((product) => {
    if (product.HotProduct) {
      return (
        <SwiperSlide>
          <Card key={product.id} product={product} />
        </SwiperSlide>
      );
    }
  });
  const Deals = Data.map((product) => {
    if (product.Offer) {
      return (
        <SwiperSlide>
          <Card key={product.id} product={product} />
        </SwiperSlide>
      );
    }
  });
  return (
    <div className="Content">
      {NewProducts.length > 0 ? (
        <h2 className="animate__animated animate__fadeInDown">
          Most Recent Products
        </h2>
      ) : (
        ""
      )}
      <Swiper
        freeMode={true}
        loop={true}
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
      {HotProducts.length > 0 ? <h2>Hottest Products</h2> : ""}
      <Swiper
        freeMode={true}
        loop={true}
        slidesPerView={5}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {HotProducts}
      </Swiper>
      {Deals.length > 0 ? <h2>Our Latest Offers!</h2> : ""}
      <Swiper
        freeMode={true}
        loop={true}
        slidesPerView={5}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {Deals}
      </Swiper>
      <div style={{ display: "flex", gap: "30px" }}>
        {reviewProduct1 && (
          <div className="productReview">
            <h4>{reviewProduct1.title}</h4>
            <Carousel id="one" images={reviewProduct1.images} />
            <p className="description">{reviewProduct1.description}</p>
            <div>
              <p className="OldPrice">{reviewProduct1.price}$</p>
              <span>
                Now Only For:
                <span style={{ fontWeight: "500" }}>
                  {reviewProduct1.price - Math.round(discount1)}$
                </span>
              </span>
              <div className="rating">
                <img src={rating1 >= 1 ? starFilled : Star}></img>
                <img src={rating1 >= 2 ? starFilled : Star}></img>
                <img src={rating1 >= 3 ? starFilled : Star}></img>
                <img src={rating1 >= 4 ? starFilled : Star}></img>
                <img src={rating1 >= 5 ? starFilled : Star}></img>
              </div>
              {reviewProduct1.stock ? (
                reviewProduct1.stock < 5 ? (
                  <p className="Stock">
                    Only{" "}
                    <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                      {reviewProduct1.stock}
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
        )}
        {reviewProduct2 ? (
          <div className="productReview">
            <h4>{reviewProduct2.title}</h4>
            <Carousel id="two" images={reviewProduct2.images} />
            <p className="description">{reviewProduct2.description}</p>
            <div>
              <p className="OldPrice">{reviewProduct2.price}$</p>
              <span>
                Now Only For:
                <span style={{ fontWeight: "500" }}>
                  {reviewProduct2.price - Math.round(discount1)}$
                </span>
              </span>
              <div className="rating">
                <img src={rating1 >= 1 ? starFilled : Star}></img>
                <img src={rating1 >= 2 ? starFilled : Star}></img>
                <img src={rating1 >= 3 ? starFilled : Star}></img>
                <img src={rating1 >= 4 ? starFilled : Star}></img>
                <img src={rating1 >= 5 ? starFilled : Star}></img>
              </div>
              {reviewProduct2.stock ? (
                reviewProduct2.stock < 5 ? (
                  <p className="Stock">
                    Only{" "}
                    <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                      {reviewProduct2.stock}
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
        ) : (
          ""
        )}
      </div>
      {AppleListEL.length > 0 ? (
        <img
          style={{ width: "90%", borderRadius: "20px" }}
          src={AppleBanner}
        ></img>
      ) : (
        ""
      )}
      {AppleListEL && (
        <Swiper
          freeMode={true}
          loop={true}
          slidesPerView={5}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {AppleListEL}
        </Swiper>
      )}
    </div>
  );
}
