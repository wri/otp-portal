import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ToggleSwitch = ({ id, activeColor, active, handleChange }) => {
  const [checked, setChecked] = useState(active);

  const handleChangeLocal = (e) => {
    const { checked: isChecked } = e.target;
    
    handleChange(id, isChecked);
    setChecked(isChecked);
  };

  return (
    <label
      htmlFor={`toggle-${id}`}
      className="c-toggle-switch"
      style={{ backgroundColor: checked && activeColor }}
    >
      <input
        type="checkbox"
        id={`toggle-${id}`}
        checked={checked}
        onChange={handleChangeLocal}
      />
      <span className="toggle-slider" />
    </label>
  );
};

ToggleSwitch.propTypes = {
  handleChange: PropTypes.func,
  active: PropTypes.bool,
  id: PropTypes.string,
  activeColor: PropTypes.string
};

export default ToggleSwitch;
