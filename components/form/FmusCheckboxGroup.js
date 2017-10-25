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
      value: props.properties.default || []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.properties.value, this.props.properties.value)) {
      this.setState({
        value: nextProps.properties.value
      });
    }
  }

  /**
   * UI EVENTS
   * - triggerChange
   * - triggerCertificationsChange
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
    return (
      <table className="fmus-checkbox-table">
        <thead>
          <tr>
            <th>
              <h3 className="c-title -default">FMUs</h3>
            </th>
            <th className="td-certifications">
              <h3 className="c-title -default">Certifications</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.options.map(option => (
            <tr key={option.value}>
              <td>
                {this.getCheckbox(option)}
              </td>
              <td className="td-certifications">
                {this.getCertifications(option)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  getCheckbox(option) {
    return (
      <Checkbox
        key={option.value}
        properties={{
          name: this.props.name,
          title: option.label,
          checked: this.state.value.includes(option.value),
          disabled: true,
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
        onChange={value => this.props.onChangeCertifications({ [option.value]: value })}
        className="-inline -small"
        name={`certification-${option.value}`}
        options={HELPERS_REGISTER.getFMUCertifications()}
        disabled={!this.state.value.includes(option.value)}
        properties={{
          name: option.value,
          default: this.props.certifications[option.value] || []
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
      <div className={`c-fmus-checkbox ${customClassName}`}>
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
  certifications: PropTypes.object,
  onChange: PropTypes.func
};
