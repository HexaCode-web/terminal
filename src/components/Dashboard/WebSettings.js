import React, { useEffect } from "react";
import { GETDOC, SETDOC } from "../../server";
import Upload from "../../assets/upload.png";
import "./WebSettings.css";
import { UPLOADPHOTO } from "../../server";
import { CreateToast } from "../../App";
import Carousel from "../carosuel";
import Star from "../../assets/star-empty.png";
import starFilled from "../../assets/star-filled.png";
import ProductSelect from "../Web customization components/ProductSelect";
import Banner from "../Banner";
import ExtraListEdit from "../Web customization components/ExtraListEdit";
import SliderList from "../../Sections/SliderList";
import PageSort from "../Web customization components/PageSort";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import FooterEdit from "../Web customization components/FooterEdit";

const WebSettings = (props) => {
  const [WebData, setWebData] = React.useState({
    headline: null,
    subHeadline: null,
    background: null,
    banner1: null,
    banner2: null,
    icon: null,
    mainProduct1: null,
    mainProduct2: null,
    pageSort: null,
    title: null,
    Lists: null,
    ExtraLists: null,
    Footer: null,
  });
  const [viewSection, setViewSection] = React.useState({
    HeaderEdit: false,
    IconEdit: false,
    MainProducts: false,
    Banners: false,
    ExtraLists: false,
    pageSort: false,
    FooterEdit: false,
  });
  const SortedProducts = props.productList.map((product) => ({
    value: product.id,
    label: product.title,
  }));
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  useEffect(() => {
    const FetchData = async () => {
      const fieldNames = [
        "headline",
        "subHeadline",
        "background",
        "banner1",
        "banner2",
        "icon",
        "mainProduct1",
        "mainProduct2",
        "pageSort",
        "title",
        "Lists",
        "ExtraLists",
        "Footer",
      ];
      const requests = fieldNames.map((fieldName) =>
        GETDOC("websiteData", fieldName)
      );
      const responses = await Promise.all(requests);
      const results = {};
      fieldNames.forEach((fieldName, index) => {
        results[fieldName] = responses[index][fieldName];
      });
      setWebData((prev) => ({
        ...prev,
        headline: results.headline,
        subHeadline: results.subHeadline,
        background: results.background,
        banner1: results.banner1,
        banner2: results.banner2,
        icon: results.icon,
        mainProduct1: results.mainProduct1,
        mainProduct2: results.mainProduct2,
        pageSort: results.pageSort,
        title: results.title,
        Lists: results.Lists,
        ExtraLists: results.ExtraLists,
        Footer: results.Footer,
      }));
    };
    FetchData();
  }, []);
  const handleInput = async (e) => {
    const { name, value, type } = e.target;
    if (type === "select-one") {
      if (value === "") {
        setWebData((prev) => {
          return { ...prev, [name]: null };
        });
        await SETDOC("websiteData", name, { [name]: null });
      } else {
        const selectedProductId = +event.target.value; // Retrieve the identifier
        const selectedProduct = props.productList.find(
          (product) => product.id == selectedProductId
        );
        setWebData((prev) => {
          return { ...prev, [name]: selectedProduct };
        });
        await SETDOC("websiteData", name, { [name]: selectedProduct });
      }
    } else if (type === "file") {
      let FileName;

      let url;
      switch (name) {
        case "icon":
          FileName = "icon";
          break;
        case "background":
          FileName = "background";
          break;
        case "Banner1":
          FileName = "banner1";
          break;
        case "Banner2":
          FileName = "banner2";
          break;
        default:
          break;
      }
      setUploadingPhoto(true);
      CreateToast("Uploading", "progress", 3000);
      url = await UPLOADPHOTO(
        `images/customize/${FileName}`,
        event.target.files[0]
      );
      await SETDOC("websiteData", FileName, { [FileName]: url });
      setWebData((prev) => {
        return { ...prev, [name]: url };
      });
      CreateToast("uploaded", "success");
      setUploadingPhoto(false);
    } else {
      setWebData((prev) => {
        return { ...prev, [name]: value };
      });
    }
  };
  const SaveData = async (section = String, Data = {}, listName = "") => {
    CreateToast("Updating", "info");
    if (section === "List") {
      const FetchedData = await GETDOC("websiteData", "ExtraLists");
      const ExtraLists = { ...FetchedData.ExtraLists, [listName]: Data };
      setWebData((prev) => {
        return { ...prev, ExtraLists: ExtraLists };
      });
      await SETDOC("websiteData", "ExtraLists", { ExtraLists });
    }
    if (section === "sec1") {
      await SETDOC("websiteData", "title", { title: WebData.title });
    }
    if (section === "sec2") {
      await SETDOC("websiteData", "headline", { headline: WebData.headline });
      await SETDOC("websiteData", "subHeadline", {
        subHeadline: WebData.subHeadline,
      });
    }
    if (section === "sec5") {
      await SETDOC("websiteData", "Lists", { Lists: WebData.Lists });
    }
    if (section === "sec6") {
      await SETDOC("websiteData", "pageSort", { pageSort: Data });
    }
    if (section === "sec7") {
      await SETDOC("websiteData", "Footer", { Footer: Data });
    }
    CreateToast("data Updated!", "success");
  };
  const handleProductChange = (selectedOption, source) => {
    setWebData((prev) => {
      return {
        ...prev,
        Lists: { ...prev.Lists, [source]: selectedOption },
      };
    });
  };
  function ReviewProducts(props) {
    const elements = props.Products.map((element, index) => {
      const rating1 = element ? Math.ceil(element.rating) : "";
      return (
        <div className="productReview">
          {element ? (
            <>
              <h4>{element.title}</h4>
              <Carousel
                id={index === 0 ? "one" : index === 1 ? "two" : ""}
                images={element.images}
              />
              <p className="description">{element.description}</p>
              <div>
                <p className="OldPrice">{element.price}$</p>
                <span>
                  Now Only For:
                  <span style={{ fontWeight: "500" }}>
                    {element.price -
                      Math.round(
                        (element.price * element.discountPercentage) / 100
                      )}
                    $
                  </span>
                </span>
                <div className="rating">
                  <img src={rating1 >= 1 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 2 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 3 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 4 ? starFilled : Star} alt="Star"></img>
                  <img src={rating1 >= 5 ? starFilled : Star} alt="Star"></img>
                </div>
                {element.stock ? (
                  element.stock < 5 ? (
                    <p className="Stock">
                      Only{" "}
                      <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                        {element.stock}
                      </span>{" "}
                      left!
                    </p>
                  ) : (
                    <p className="Stock">In Stock</p>
                  )
                ) : (
                  <p className="Stock out">Out of stock</p>
                )}
              </div>
            </>
          ) : (
            <p>no product was selected</p>
          )}
        </div>
      );
    });
    return <div className="reviewWrapper">{elements}</div>;
  }
  const ChangeView = (SectionToChange) => {
    setViewSection((prev) => {
      return { ...prev, [SectionToChange]: !prev[SectionToChange] };
    });
    document
      .getElementById(SectionToChange)
      .classList.toggle("rotate-up", viewSection.SectionToChange);
  };

  const extraLists = [
    { key: "ExtraOne", listNum: "First" },
    { key: "ExtraTwo", listNum: "Second" },
    { key: "ExtraThree", listNum: "Third" },
    { key: "ExtraFour", listNum: "Fourth" },
  ];
  const renderExtraLists = extraLists.map((list) => (
    <React.Fragment key={list.key}>
      <ExtraListEdit
        List={WebData.ExtraLists?.[list.key]}
        ListNum={list.listNum}
        SortedProducts={SortedProducts}
        SaveExtraList={SaveData}
      />
      <h5>Review:</h5>
      <div className="Slider-review-wrapper">
        <SliderList
          Data={WebData.ExtraLists?.[list.key]}
          ProductList={props.productList}
        />
      </div>
    </React.Fragment>
  ));
  return (
    <div className="Container">
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("IconEdit");
        }}
      >
        <h3>General customization</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="IconEdit" />
      </div>
      {viewSection.IconEdit && (
        <section className="IconEdit">
          <div className="Data">
            <div className="formItem">
              <span>Upload an icon: </span>
              <label htmlFor="iconUpload">
                <img src={Upload} />
              </label>
              <input
                disabled={uploadingPhoto ? true : false}
                onChange={handleInput}
                name="icon"
                type="file"
                accept="image/png"
                id="iconUpload"
                style={{ display: "none" }}
              />
            </div>
            <div className="formItem">
              <label htmlFor="title">Website Name:</label>
              <input
                onChange={handleInput}
                type="text"
                name="title"
                id="title"
                placeholder="Website Name"
                value={WebData.title}
              />
            </div>
            <button
              className="button"
              onClick={() => {
                SaveData("sec1");
              }}
            >
              Save Changes
            </button>
          </div>
          <div className="Nav" style={{ position: "static" }}>
            <span> preview:</span>
            <div className="nav animate__animated animate__fadeInDown">
              <a>
                <img className="logo" src={WebData.icon}></img>
              </a>
            </div>
          </div>
        </section>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("HeaderEdit");
        }}
      >
        <h3> Header customization</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="HeaderEdit" />
      </div>
      {viewSection.HeaderEdit && (
        <section className="HeaderEdit">
          <div className="Data">
            <div className="formItem">
              <label htmlFor="Title">headline:</label>
              <textarea
                id="Title"
                onChange={handleInput}
                name="headline"
              ></textarea>
            </div>
            <div className="formItem">
              <label htmlFor="SubTitle">SubTitle:</label>
              <textarea
                id="SubTitle"
                onChange={handleInput}
                name="subHeadline"
              ></textarea>
            </div>
            <div className="formItem">
              <span>Upload background: </span>
              <label htmlFor="BackGroundUpload">
                <img src={Upload} />
              </label>
              <input
                disabled={uploadingPhoto ? true : false}
                onChange={handleInput}
                name="background"
                type="file"
                accept="image"
                id="BackGroundUpload"
                style={{ display: "none" }}
              />
            </div>
            <button
              className="button"
              onClick={() => {
                SaveData("Sec2");
              }}
            >
              Save
            </button>
          </div>
          <div className="Header">
            <img className="bg-img" src={WebData.background} />
            <div className="HeaderContent ">
              <h1 className="animate__animated animate__fadeInDown">
                {WebData.headline}
              </h1>
              <h4 className="animate__animated animate__fadeInUp">
                {WebData.subHeadline}
              </h4>
            </div>
          </div>
        </section>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("MainProducts");
        }}
      >
        <h3> Main Products customization</h3>
        <KeyboardArrowDownOutlinedIcon
          className="indicator"
          id="MainProducts"
        />
      </div>

      {viewSection.MainProducts && (
        <section className="MainProducts">
          <div className="Data">
            <div className="formItem">
              <label htmlFor="product1">Select the first main product:</label>
              <select
                id="product1"
                value={WebData.mainProduct1?.id}
                onChange={handleInput}
                name="mainProduct1"
              >
                <option value={""}>Select</option>
                {props.productList.map((product, index) => (
                  <option key={index} value={+product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="formItem">
              <label htmlFor="product2">Select the second main product:</label>
              <select
                id="product2"
                value={WebData.mainProduct2?.id}
                onChange={handleInput}
                name="mainProduct2"
              >
                <option value={""}>Select</option>
                {props.productList.map((product) => (
                  <option key={product.id} value={+product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {WebData.mainProduct1 || WebData.mainProduct2 ? (
            <ReviewProducts
              Products={[WebData.mainProduct1, WebData.mainProduct2]}
            />
          ) : null}
        </section>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("Banners");
        }}
      >
        <h3> Banners</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="Banners" />
      </div>
      {viewSection.Banners && (
        <section className="Banners">
          <p>
            Banners are wide photos along with a slider of products underneath
            it, the photo preferably should be 1500 in width at least to avoid
            any issues
          </p>
          <div className="Part">
            <h5>First Banner and its slider</h5>
            <div className="Data">
              <span>Upload banner Cover:</span>
              <label htmlFor="Banner1">
                <img src={Upload} />
              </label>
              <input
                disabled={uploadingPhoto ? true : false}
                onChange={handleInput}
                name="Banner1"
                type="file"
                accept="image"
                id="Banner1"
                style={{ display: "none" }}
              />
              <div>
                <h3>Select Products:</h3>
                <ProductSelect
                  options={SortedProducts}
                  value={WebData.Lists?.Banner1Products}
                  onChange={handleProductChange}
                  source="Banner1Products"
                />
              </div>
            </div>
          </div>
          <div className="Part">
            <h5>Second Banner and its slider</h5>
            <div className="Data">
              <span>Upload banner Cover:</span>
              <label htmlFor="Banner2">
                <img src={Upload} />
              </label>
              <input
                disabled={uploadingPhoto ? true : false}
                onChange={handleInput}
                name="Banner2"
                type="file"
                accept="image"
                id="Banner2"
                style={{ display: "none" }}
              />
              <div>
                <h3>Select Products:</h3>
                <ProductSelect
                  options={SortedProducts}
                  value={WebData.Lists?.Banner2Products}
                  onChange={handleProductChange}
                  source="Banner2Products"
                />
              </div>
            </div>
          </div>
          <button
            className="button"
            onClick={() => {
              SaveData("sec5");
            }}
          >
            Save Changes
          </button>
          <div className="Review">
            <Banner
              number="First"
              url={WebData?.banner1}
              Data={WebData.Lists?.Banner1Products}
              ProductList={props.productList}
            />
            <Banner
              number="Second"
              url={WebData?.banner2}
              Data={WebData.Lists?.Banner2Products}
              ProductList={props.productList}
            />
          </div>
        </section>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("ExtraLists");
        }}
      >
        <h3> Extra Lists</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="ExtraLists" />
      </div>

      {viewSection.ExtraLists && (
        <>
          {WebData.ExtraLists && (
            <section className="Lists">
              <p>
                in this section you can show or hide up to 4 lists and add
                products in them and name them however you want and if you want
                them to have banners or not, but always remember the banner
                should be at least in 1500px wide
              </p>
              {renderExtraLists}
            </section>
          )}
        </>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("pageSort");
        }}
      >
        <h3> Page Order</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="pageSort" />
      </div>
      {viewSection.pageSort && (
        <>
          {WebData.pageSort && (
            <PageSort PageSort={WebData.pageSort} Save={SaveData} />
          )}
        </>
      )}
      <div
        className="Title-Wrapper"
        onClick={() => {
          ChangeView("FooterEdit");
        }}
      >
        <h3> Footer Info</h3>
        <KeyboardArrowDownOutlinedIcon className="indicator" id="FooterEdit" />
      </div>
      {viewSection.FooterEdit && (
        <>
          {WebData.Footer && (
            <FooterEdit Data={WebData.Footer} Save={SaveData} />
          )}
        </>
      )}
    </div>
  );
};

export default WebSettings;
