import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import Card from "../Card/Card";
import "./Banner.css";
import { v4 as uid } from "uuid";

const Banner = (props) => {
  let delay = 0;
  const BannerList = props.Data?.map((product) => {
    const target = props.ProductList.find((srcProduct) => {
      return srcProduct.id === product.value;
    });
    delay += 0.1;
    return (
      <SwiperSlide key={uid()}>
        <Card product={target} Delay={delay.toString()} />
      </SwiperSlide>
    );
  });

  return (
    <div className="Banner">
      {props.number && <h4>{props.number} Banner review</h4>}
      {props.url ? (
        <img className="MainImg" src={props.url} />
      ) : (
        <h5>no photo selected</h5>
      )}
      <Swiper
        freeMode={true}
        loop={false}
        slidesPerView={5}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {BannerList}
      </Swiper>
    </div>
  );
};

export default Banner;
