import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { GETDOC } from "../server";
export default function Header(props) {
  const [WebsiteData, setWebsiteData] = React.useState({
    headline: "",
    subtitle: "",
  });
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 1000);
  }, []);
  useEffect(() => {
    const FetchWebsiteData = async () => {
      await GETDOC("websiteData", "headline").then((FetchedHeadline) =>
        setWebsiteData((prev) => {
          return { ...prev, headline: FetchedHeadline.headline };
        })
      );
      await GETDOC("websiteData", "subHeadline").then((FetchedSubHeadline) =>
        setWebsiteData((prev) => {
          return { ...prev, subtitle: FetchedSubHeadline.subheadline };
        })
      );
    };
    FetchWebsiteData();
  }, []);
  const element = props.catagories.map((category) => {
    return (
      <li className="Category" key={uuidv4()}>
        <a href={`/category/${category.Name}`}>
          <img src={category.icon}></img>
        </a>
      </li>
    );
  });
  return (
    <div className="Header">
      <div className="bg-img"></div>
      <div className="HeaderContent ">
        <h1 className="animate__animated animate__fadeInDown">
          {WebsiteData.headline}
        </h1>
        {Object.keys(useParams()).length === 0 ? (
          <h4 className="animate__animated animate__fadeInUp">
            {WebsiteData.subtitle}
          </h4>
        ) : (
          ""
        )}
        {loading && <ul className="Category-wrapper">{element}</ul>}{" "}
      </div>
    </div>
  );
}
