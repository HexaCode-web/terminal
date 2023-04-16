import React, { useEffect } from "react";
import Card from "./Card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";

import Carousel from "./carosuel";
import AppleBanner from "../assets/appleBanner.jpg";
import sortBy from "sort-by";
import { v4 as uid } from "uuid";
import HottestProducts from "../Sections/HottestProducts";
import LatestOffers from "../Sections/LatestOffers";
import RecentProducts from "../Sections/RecentProducts";
import ReviewProducts from "../Sections/ReviewProducts";
import { GETDOC, SETDOC } from "../server";
export default function Content(props) {
  const Data = props.List;
  const AppleList = [];
  const [WebsiteData, setWebsiteData] = React.useState({
    pageSort: {},
  });
  const FetchWebData = async () => {
    await GETDOC("websiteData", "pageSort").then((res) => {
      setWebsiteData((prev) => {
        return {
          ...prev,
          pageSort: res.pageSort,
        };
      });
    });
  };
  const sortedEntries = Object.entries(WebsiteData.pageSort).sort(
    (a, b) => a[1] - b[1]
  );
  const componentMap = {
    HottestProducts,
    LatestOffers,
    RecentProducts,
    ReviewProducts,
  };
  Data.sort(sortBy("id"));
  Data.forEach((product) => {
    if (product.brand === "Apple") {
      AppleList.push(product);
    }
  });

  const AppleListEL = AppleList.map((product) => {
    return (
      <SwiperSlide key={uid()}>
        <Card product={product} />
      </SwiperSlide>
    );
  });
  useEffect(() => {
    FetchWebData();
  }, []);

  return (
    <div className="Content">
      {sortedEntries.map(([key, value]) => {
        const Component = componentMap[key];
        return <Component key={key} value={value} ProductList={Data} />;
      })}
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
