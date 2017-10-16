import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';

// Components
import Checkbox from './Checkbox';
import CheckboxGroup from './CheckboxGroup';
import FormElement from './FormElement';

export default class FmusCheckboxGroup extends FormElement {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      value: this.props.value || []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.value, this.props.value)) {
      this.setState({
        value: nextProps.value
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
      return (
        <div>
          {this.getCheckbox(option)}
          {this.getCertifications(option)}
        </div>
      )
    });

    return checkboxList;
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
          default: option.value
        }}
        onChange={value => this.triggerChange(value)}
      />
    );
  }

  getCertifications(option) {
    return (
      <CheckboxGroup
        onChange={value => console.info(value)}
        className="-inline"
        name={`certification-${option.value}`}
        options={HELPERS_REGISTER.getFMUCertifications()}
        properties={{
          name: option.value
          // default: this.state.form.fmus
        }}

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

FmusCheckboxGroup.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.array,
  className: PropTypes.string,
  options: PropTypes.array,
  grid: PropTypes.object,
  onChange: PropTypes.func
};
