import React, { useEffect } from "react";
import "./Footer.css";
import Facebook from "../../assets/facebook.png";
import Youtube from "../../assets/youtube.png";
import Twitter from "../../assets/twitter.png";
import Telegram from "../../assets/telegram.png";
import Pinterest from "../../assets/pinterest.png";
import Instagram from "../../assets/instagram.png";
import { CreateToast } from "../../App";
import { GETDOC } from "../../server";
const Footer = (props) => {
  const [FooterData, setFooterData] = React.useState({ logo: "" });
  useEffect(() => {
    const FetchData = async () => {
      GETDOC("websiteData", "Footer").then((res) => {
        setFooterData((prev) => {
          return { ...prev, ...res.Footer };
        });
      });
      GETDOC("websiteData", "icon").then((res) => {
        setFooterData((prev) => {
          return { ...prev, logo: res.icon };
        });
      });
    };
    FetchData();
  }, []);
  const element = props.catagories.map((category) => {
    return (
      <li>
        <a href={`/category/${category.Name}`}>{category.Name}</a>
      </li>
    );
  });
  const SocialContainer = [];

  for (const Social in FooterData.Socials) {
    SocialContainer.push({ name: Social, Link: FooterData.Socials[Social] });
  }
  const RenderSocials = SocialContainer?.map((Social) => {
    let img = "";
    switch (Social.name) {
      case "Facebook":
        img = Facebook;
        break;
      case "Youtube":
        img = Youtube;
        break;
      case "Twitter":
        img = Twitter;
        break;
      case "Telegram":
        img = Telegram;
        break;
      case "Pinterest":
        img = Pinterest;
        break;
      case "Instagram":
        img = Instagram;
        break;
      default:
        break;
    }
    return Social.Link ? (
      <li data-aos="fade-up">
        <a href={Social.Link}>
          <img src={img} />
        </a>
      </li>
    ) : (
      ""
    );
  });
  return (
    <div className="FooterWrapper">
      <div className="columns">
        <div className="col">
          <p>Catagories</p>
          <ul>{element}</ul>
        </div>
        <div className="col">
          <p>Support</p>
          <ul>
            <li>
              <a
                href="#"
                onClick={() => {
                  props.activeUser
                    ? props.activeUser.admin
                      ? CreateToast("admins don't have pending orders", "error")
                      : (window.location.href = "/User")
                    : CreateToast("please login first", "error");
                }}
              >
                Order status
              </a>
            </li>
          </ul>
        </div>
        <div className="col">
          <p>company</p>
          <ul>
            <li>
              <a href="#">Customer service</a>
            </li>
            <li>
              <a href="#">Terms of use</a>
            </li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
          </ul>
        </div>
        <div className="col">
          <p>Contact</p>
          {FooterData.Email && (
            <div className="field">
              <span>Email</span>
              <p>{FooterData.Email}</p>
            </div>
          )}
          {FooterData.Phone && (
            <div className="field">
              <span>Telephone</span>
              <p>{FooterData.Phone}</p>
            </div>
          )}
          {FooterData.Address && (
            <div className="field">
              <span>Address</span>
              <p>{FooterData.Address}</p>
            </div>
          )}
        </div>
      </div>
      <div className="Links">
        <p>Follow us</p>
        <ul>{RenderSocials}</ul>
      </div>
      <div className="CopyRight">
        <img src={FooterData.logo}></img>
        <p>&copy; {props.webName} 2023</p>
      </div>
    </div>
  );
};

export default Footer;
