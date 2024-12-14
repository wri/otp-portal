import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'react-fast-compare';
import { injectIntl } from 'react-intl';

// Utils
import { CERTIFICATIONS } from 'constants/fmu';

// Components
import CheckboxGroup from './CheckboxGroup';
import FormElement from './FormElement';

class FmusCheckboxGroup extends FormElement {
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
              <h3 className="c-title -default">{this.props.intl.formatMessage({ id: 'certifications' })}</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.options.map(option => (
            <tr key={option.value}>
              <td>
                {option.label}
              </td>
              <td className="td-certifications">
                {this.getAllCertifications(option)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  getAllCertifications(option) {
    return (
      <CheckboxGroup
        onChange={value => this.props.onChangeCertifications({ [option.value]: value })}
        className="-single-row -small"
        name={`certification-${option.value}`}
        options={CERTIFICATIONS}
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
  onChange: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(FmusCheckboxGroup, {forwardRef: true});
