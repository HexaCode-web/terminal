import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { GETDOC } from "../../server";
import "./Header.css";
export default function Header(props) {
  let delay = 0;
  const [WebsiteData, setWebsiteData] = React.useState({
    headline: "",
    subtitle: "",
    background: "",
  });
  console.log(WebsiteData.subtitle);
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 1000);
  }, []);
  useEffect(() => {
    const FetchWebsiteData = async () => {
      await Promise.all([
        GETDOC("websiteData", "background").then((background) =>
          setWebsiteData((prev) => {
            return { ...prev, background: background.background };
          })
        ),
        GETDOC("websiteData", "headline").then((FetchedHeadline) =>
          setWebsiteData((prev) => {
            return { ...prev, headline: FetchedHeadline.headline };
          })
        ),
        GETDOC("websiteData", "subHeadline").then((FetchedSubHeadline) =>
          setWebsiteData((prev) => {
            return { ...prev, subtitle: FetchedSubHeadline.subHeadline };
          })
        ),
      ]);
    };
    FetchWebsiteData();
  }, []);
  const element = props.catagories.map((category) => {
    delay += 0.1;
    return (
      <li
        className="Category animate__animated animate__fadeInUp"
        style={{ animationDelay: `${delay}s` }}
        key={uuidv4()}
      >
        <a href={`/category/${category.Name}`}>
          <img src={category.icon}></img>
        </a>
      </li>
    );
  });
  return (
    <div className="Header">
      <img className="bg-img" src={WebsiteData.background} />

      <div className="HeaderContent ">
        <h1 className="animate__animated animate__fadeInDown">
          {WebsiteData.headline}
        </h1>
        <h4 className="animate__animated animate__fadeInUp">
          {WebsiteData.subtitle}
        </h4>
        {loading && <ul className="Category-wrapper">{element}</ul>}{" "}
      </div>
    </div>
  );
}
