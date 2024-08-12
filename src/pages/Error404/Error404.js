import React from "react";
import "./Error404.css";
const Error404 = () => {
  return (
    <div className="NotFound">
      <h1>404</h1>
      <p>that page doesn't exist or unavailable right now</p>
      <button
        onClick={() => {
          window.location.href = "/";
        }}
      >
        go back to home
      </button>
    </div>
  );
};

export default Error404;
