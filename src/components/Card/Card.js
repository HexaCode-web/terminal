import Star from "../../assets/star-empty.png";
import starFilled from "../../assets/star-filled.png";
import "./Card.css";
export default function Card(props) {
  const productData = props.product;
  const animationDelay = `${props.Delay}s`;

  const rating = Math.round(productData.rating);
  const discount = (productData.price * productData.discountPercentage) / 100;
  return (
    <a
      className="card animate__animated animate__fadeInUp"
      style={{ animationDelay: animationDelay }}
      href={`/product/${productData.id}`}
    >
      <img src={productData.thumbnail} className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">{productData.title}</h5>
        {!productData.Offer && <p className="Price">{productData.price}$</p>}
        {productData.Offer && (
          <div style={{ marginBottom: "1rem" }}>
            <span className="OldPrice">{productData.price}$</span>
            <span>{productData.price - Math.round(discount)}$</span>
          </div>
        )}
        <div className="CardRating">
          <img src={rating >= 1 ? starFilled : Star}></img>
          <img src={rating >= 2 ? starFilled : Star}></img>
          <img src={rating >= 3 ? starFilled : Star}></img>
          <img src={rating >= 4 ? starFilled : Star}></img>
          <img src={rating >= 5 ? starFilled : Star}></img>
        </div>
        {productData.stock ? (
          productData.stock < 5 ? (
            <p className="Stock">
              Only{" "}
              <span style={{ color: "#ee233a", fontWeight: "bolder" }}>
                {productData.stock}
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
    </a>
  );
}
