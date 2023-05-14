import "./Widget.css";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
const Widget = (props) => {
  const addDollarSign = props.data.Dollar;
  let positive = props.data.percent > 0;
  return (
    <div
      className="Widget animate__animated animate__fadeInDown"
      style={{ animationDelay: props.delay }}
    >
      <div className="Left">
        <span className="Title">{props.data.Title}</span>
        <span className="Info">
          {addDollarSign ? "$" : ""}
          {props.data.Info}
        </span>
        <span className="difference"></span>
        {props.data.Link ? (
          <span
            className="Link"
            onClick={() => {
              props.setActivePage(props.data.Link);
            }}
          >
            See more {props.data.Title}
          </span>
        ) : (
          ""
        )}
      </div>
      <div className="Right">
        {positive ? (
          <div className="indication">
            {positive ? (
              <KeyboardArrowUpIcon className="indicator" />
            ) : (
              <KeyboardArrowDownOutlinedIcon className="indicator red" />
            )}
            <span className={`Percentage ${positive ? "" : "red"}`}>
              {props.data.percent}%
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Widget;
