import React from "react";
import Select from "react-select";

const DarkModeSelect = {
  control: (provided) => ({
    ...provided,
    background: "#333",
    color: "white",
    borderRadius: "4px",
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? "blue" : "#333",
    color: state.isSelected ? "white" : "white",
    "&:hover": {
      background: "#3B80AF",
      color: "white",
    },
  }),
};
const ProductSelect = ({ options, value, onChange, source }) => {
  const handleChange = (selectedOption) => {
    onChange(selectedOption, source);
  };

  return (
    <Select
      options={options}
      value={value}
      isMulti={true}
      onChange={handleChange}
      styles={DarkModeSelect}
    />
  );
};

export default ProductSelect;
