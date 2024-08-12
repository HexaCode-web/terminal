import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import { v4 as uid } from "uuid";

import Card from "../components/Card/Card";
export default function HottestProducts(props) {
  let delay = 0;
  const HotProducts = props.ProductList.map((product) => {
    delay += 0.1;
    if (product.HotProduct) {
      return (
        <SwiperSlide key={uid()}>
          <Card product={product} Delay={delay.toString()} />
        </SwiperSlide>
      );
    }
  });
  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {HotProducts.length > 0 && <h2>Hottest Products</h2>}{" "}
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
    </div>
  );
}
