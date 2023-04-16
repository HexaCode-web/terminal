import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import { v4 as uid } from "uuid";
import sortBy from "sort-by";

import Card from "../components/Card";
export default function HottestProductsComponent(props) {
  const Deals = props.ProductList.sort(sortBy("id")).map((product) => {
    if (product.Offer) {
      return (
        <SwiperSlide key={uid()}>
          <Card product={product} />
        </SwiperSlide>
      );
    }
  });
  return (
    <>
      {Deals.length > 0 && <h2>Our Latest Offers!</h2>}
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
    </>
  );
}
