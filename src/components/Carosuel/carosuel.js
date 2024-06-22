import { v4 as uuidv4 } from "uuid";
export default function Carousel(props) {
  const slideBtn = props.images.map((photo, index) => {
    return (
      <button
        key={uuidv4()}
        type="button"
        data-bs-target={`#${props.id}`}
        data-bs-slide-to={index}
        className={index === 0 ? "active" : ""}
        aria-current={index === 0 ? true : ""}
        aria-label={`Slide ${index + 1}`}
      ></button>
    );
  });
  const photos = props.images.map((photo, index) => {
    return (
      <div
        key={uuidv4()}
        className={`carousel-item ${index === 0 ? "active" : ""}`}
        data-bs-interval="5000"
      >
        <img src={photo.url} className="d-block" alt="..." />
      </div>
    );
  });
  return (
    <div
      id={props.id}
      className="carousel carousel-dark slide"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators">{slideBtn}</div>
      <div className="carousel-inner">{photos}</div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target={`#${props.id}`}
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target={`#${props.id}`}
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
