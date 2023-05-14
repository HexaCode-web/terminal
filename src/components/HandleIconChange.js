import React, { useState } from "react";

export default function Icons({
  defaultSrc,
  hoverSrc,
  className = "",
  onClick = null,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <img
      onClick={onClick ? onClick : ""}
      className={className}
      src={isHovered ? hoverSrc : defaultSrc}
      alt="Image"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
