import React, { useEffect } from "react";
import HottestProducts from "../Sections/HottestProducts";
import LatestOffers from "../Sections/LatestOffers";
import RecentProducts from "../Sections/RecentProducts";
import { default as Banner1 } from "./Banner";
import { default as Banner2 } from "./Banner";
import { default as ExtraOne } from "../Sections/SliderList";
import { default as ExtraTwo } from "../Sections/SliderList";
import { default as ExtraThree } from "../Sections/SliderList";
import { default as ExtraFour } from "../Sections/SliderList";

import ReviewProducts from "../Sections/ReviewProducts";
import "./Content.css";
import { GETCOLLECTION, GETDOC } from "../server";

export default function Content() {
  const [Products, setProducts] = React.useState([]);
  const [WebsiteData, setWebsiteData] = React.useState({
    pageSort: {},
    banner1: null,
    banner2: null,
    Lists: null,
    ExtraLists: null,
  });

  const FetchWebsiteData = async () => {
    await Promise.all([
      GETCOLLECTION("products").then((res) => {
        setProducts(res);
      }),
      GETDOC("websiteData", "pageSort").then((res) =>
        setWebsiteData((prev) => {
          return { ...prev, pageSort: res.pageSort };
        })
      ),
      GETDOC("websiteData", "ExtraLists").then((res) =>
        setWebsiteData((prev) => {
          return { ...prev, ExtraLists: res.ExtraLists };
        })
      ),
      GETDOC("websiteData", "banner1").then((res) =>
        setWebsiteData((prev) => {
          return { ...prev, banner1: res.banner1 };
        })
      ),
      GETDOC("websiteData", "banner2").then((res) =>
        setWebsiteData((prev) => {
          return { ...prev, banner2: res.banner2 };
        })
      ),
      GETDOC("websiteData", "Lists").then((res) =>
        setWebsiteData((prev) => {
          return { ...prev, Lists: res.Lists };
        })
      ),
    ]);
  };
  console.log(WebsiteData.ExtraLists);
  const sortedEntries = Object.entries(WebsiteData.pageSort).sort(
    (a, b) => a[1] - b[1]
  );
  const componentMap = {
    HottestProducts,
    LatestOffers,
    RecentProducts,
    ReviewProducts,
    Banner1,
    Banner2,
    ExtraOne,
    ExtraTwo,
    ExtraThree,
    ExtraFour,
  };

  useEffect(() => {
    FetchWebsiteData();
  }, []);

  return (
    <div className="Content">
      {sortedEntries.map(([key, value]) => {
        let Data;
        let url;

        switch (key) {
          case "Banner1":
            Data = WebsiteData.Lists.Banner1Products;
            url = WebsiteData.banner1;
            break;
          case "Banner2":
            Data = WebsiteData.Lists.Banner2Products;
            url = WebsiteData.banner2;
            break;
          case "ExtraThree":
            Data = WebsiteData.ExtraLists.ExtraOne;
            break;
          case "ExtraTwo":
            Data = WebsiteData.ExtraLists.ExtraTwo;
            break;
          case "ExtraFour":
            Data = WebsiteData.ExtraLists.ExtraFour;
            break;
          case "ExtraOne":
            Data = WebsiteData.ExtraLists.ExtraThree;
            break;
          default:
            break;
        }
        const Component = componentMap[key];
        return (
          <Component
            key={key}
            value={value}
            ProductList={Products}
            Data={Data}
            url={url}
          />
        );
      })}
    </div>
  );
}
