import React from 'react';
import PropTypes from 'prop-types';


class ToggleSwitch extends React.Component {
  state = {
    checked: this.props.active
  }

  handleChange = (e) => {
    const { id, handleChange } = this.props;
    const { checked } = e.target;

    handleChange(id, checked);

    this.setState({ checked });
  }

  render() {
    const { id, activeColor } = this.props;
    const { checked } = this.state;

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
          onChange={this.handleChange}
        />
        <span className="toggle-slider" />
      </label>
    );
  }
}

ToggleSwitch.propTypes = {
  handleChange: PropTypes.func,
  active: PropTypes.bool,
  id: PropTypes.string,
  activeColor: PropTypes.string
};

export default ToggleSwitch;
