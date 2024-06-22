import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper";
import "swiper/css/pagination";
import Card from "../components/Card/Card";
import "../components/Banner/Banner.css";
import { v4 as uid } from "uuid";

const SliderList = (props) => {
  const { URL, Products, Title, ShowPhoto, Show } = props.Data;
  let AnimationDelay = 0;
  const SliderList = Products?.map((product) => {
    const target = props.ProductList.find((srcProduct) => {
      return srcProduct.id === product.value;
    });

    AnimationDelay += 0.1;
    return (
      <SwiperSlide key={uid()}>
        <Card product={target} Delay={AnimationDelay.toString()} />
      </SwiperSlide>
    );
  });

  return (
    <div className="Banner">
      {Show && (
        <>
          {Title && <h4>{Title}</h4>}
          {ShowPhoto && <img className="MainImg" src={URL} />}
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
            {SliderList}
          </Swiper>
        </>
      )}
    </div>
  );
};

export default SliderList;
/*{
    "URL": "",
    "Products": [
        {
            "label": "iPhone x",
            "value": 0
        }
    ],
    "Title": "first List",
    "ShowPhoto": false,
    "Show": false
}*/
