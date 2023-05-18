import React from "react";
import "./PageSort.css";
const PageSort = (props) => {
  const [PageSort, setPageSort] = React.useState(props.PageSort);
  const handleSelectChange = (key, value) => {
    setPageSort((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selects = [];

  for (const key in PageSort) {
    const options = [];
    let name;
    switch (key) {
      case "Banner1":
        name = "First Banner";
        break;
      case "Banner2":
        name = "Second Banner";
        break;
      case "ExtraOne":
        name = "First Extra List";
        break;
      case "ExtraTwo":
        name = "Second Extra List";
        break;
      case "ExtraThree":
        name = "Third Extra List";
        break;
      case "ExtraFour":
        name = "Fourth Extra List";
        break;
      case "HottestProducts":
        name = "Hottest Products List";
        break;
      case "LatestOffers":
        name = "Latest Offers List";
        break;
      case "RecentProducts":
        name = "Recent Products List";
        break;
      case "ReviewProducts":
        name = "Main Products List";
        break;
      default:
        break;
    }
    for (let i = 1; i <= 10; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    selects.push(
      <div key={key}>
        <h6>{name}</h6>
        <select
          value={PageSort[key]}
          onChange={(e) => handleSelectChange(key, parseInt(e.target.value))}
        >
          {options}
        </select>
      </div>
    );
  }

  return (
    <section className="PageSort">
      <p>
        here you can control how your lists appear on the page keeping in mind{" "}
        <strong>that number one is the top of the page after the header</strong>
      </p>
      <span>(if one of the extra lists is hidden it will be ignored)</span>
      <div className="Selects-wrapper">{selects}</div>
      <button
        className="button"
        onClick={() => {
          props.Save("sec6", PageSort);
        }}
      >
        Save
      </button>
    </section>
  );
};

export default PageSort;
