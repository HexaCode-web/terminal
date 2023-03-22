import React from "react";
import { useParams } from "react-router-dom";
export default function Header(props) {
  console.log();
  const mainAR = [];
  for (let category in props.catagories) {
    let photoURL;
    for (let property in props.cataIcons) {
      if (property === category) {
        photoURL = props.cataIcons[property];
      }
    }
    mainAR.push({ photoURL, category });
  }
  const element = mainAR.map((item) => {
    return (
      <li className="Category">
        <a href={`category/${item.category}`}>
          <img src={item.photoURL}></img>
        </a>
      </li>
    );
  });
  return (
    <div className="Header">
      <div className="bg-img"></div>
      <div className="HeaderContent ">
        <h1 className="animate__animated animate__fadeInDown">
          The Only Electronics Store You Will Ever Need
        </h1>
        {Object.keys(useParams()).length === 0 ? (
          <h4 className="animate__animated animate__fadeInUp">
            Explore our variety of Catagories
          </h4>
        ) : (
          ""
        )}
        <ul className="Category-wrapper">{element}</ul>
      </div>
    </div>
  );
}
