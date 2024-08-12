import React from "react";
import Star from "../assets/star-empty.png";
import starFilled from "../assets/star-filled.png";
export default function Rate(props) {
  const name = props.rate.Name;

  const user = props.rate.User;
  const starsGiven = props.rate.Stars;
  const review = props.rate.review;
  return (
    <div className="RateWrapper">
      <div className="ratingOuter">
        <img src={starsGiven >= 1 ? starFilled : Star}></img>
        <img src={starsGiven >= 2 ? starFilled : Star}></img>
        <img src={starsGiven >= 3 ? starFilled : Star}></img>
        <img src={starsGiven >= 4 ? starFilled : Star}></img>
        <img src={starsGiven >= 5 ? starFilled : Star}></img>
      </div>
      <p>{review}</p>
      <p className="User">{name.trim() ? name : user}</p>
    </div>
  );
}
