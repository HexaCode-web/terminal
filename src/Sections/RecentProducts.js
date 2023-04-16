import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import { v4 as uid } from "uuid";

import Card from "../components/Card";
export default function HottestProductsComponent(props) {
  const NewProducts = props.ProductList.slice(-5).map((product) => {
    return (
      <SwiperSlide key={uid()}>
        <Card product={product} />
      </SwiperSlide>
    );
  });
  return (
    <>
      {NewProducts.length > 0 && <h2>Most Recent Products</h2>}
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
    </>
  );
}
