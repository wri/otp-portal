import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'react-fast-compare';
import { injectIntl } from 'react-intl';

import Checkbox from './Checkbox';
import FormElement from './FormElement';

class CheckboxGroup extends FormElement {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      value: props.properties.default || []
    };
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.properties.value, this.props.properties.value)) {
      this.setState({
        value: this.props.properties.value
      });
    }
  }

  /**
   * UI EVENTS
   * - triggerChange
  */
  triggerChange(obj) {
    // Send objects
    const selectedObj = this.props.options.find(option => option.value === obj.value);
    const newValue = this.state.value.slice(0);

    if (obj.checked) {
      newValue.push(selectedObj.value);
    } else {
      newValue.splice(newValue.indexOf(selectedObj.value), 1);
    }


    this.setState({ value: newValue }, () => {
      // Trigger validation
      this.triggerValidate();
      // Publish the new value to the form
      if (this.props.onChange) this.props.onChange(this.state.value);
    });
    this.props.onChange && this.props.onChange(newValue);
  }

  getCheckboxList() {
    const { grid } = this.props;

    const checkboxList = this.props.options.map((option) => {
      if (this.props.grid) {
        const gridClassNames = classnames({
          [`small-${grid.small || 12}`]: true,
          [`medium-${grid.medium || 12}`]: true,
          [`large-${grid.large || 12}`]: true
        });

        return (
          <div key={option.value} className={`column ${gridClassNames}`}>
            {this.getCheckbox(option)}
          </div>
        );
      }

      return this.getCheckbox(option);
    });

    return (grid) ?
      <div className="row l-row">{checkboxList}</div> :
      checkboxList;
  }

  getCheckbox(option) {
    return (
      <Checkbox
        key={option.value}
        properties={{
          name: this.props.name,
          title: option.label,
          checked: this.state.value.includes(option.value),
          value: option.value,
          default: option.value,
          disabled: this.props.disabled
        }}
        onChange={value => this.triggerChange(value)}
      />
    );
  }

  render() {
    const { className } = this.props;

    const customClassName = classnames({
      [className]: !!className
    });

    return (
      <div className={`c-checkbox-box ${customClassName}`}>
        {this.props.title &&
          <span className="checkbox-box-title">{this.props.title}</span>
        }

        {this.getCheckboxList()}
      </div>
    );
  }
}

CheckboxGroup.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.array,
  className: PropTypes.string,
  options: PropTypes.array,
  grid: PropTypes.object,
  onChange: PropTypes.func
};

export default injectIntl(CheckboxGroup, {forwardRef: true});
