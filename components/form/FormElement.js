import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';

// Intl
import { intlShape } from 'react-intl';

import Validator from './Validator';

class FormElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.properties.default,
      valid: null,
      error: []
    };

    // VALIDATOR
    this.validator = new Validator(props.intl);

    // BINDINGS
    this.triggerChange = this.triggerChange.bind(this);
    this.triggerValidate = this.triggerValidate.bind(this);
  }

  componentDidMount() {
    if (this.state.value && this.state.value.length) {
      this.triggerValidate();
    }
  }

  componentDidUpdate(prevProps) {
    const prevPropsParsed = pick(prevProps, ['properties', 'validations']);
    const currentPropsParsed = pick(this.props, ['properties', 'validations']);

    if (!isEqual(prevPropsParsed, currentPropsParsed)) {
      this.triggerValidate();
    }

    const hasValue = Object.prototype.hasOwnProperty.call(this.props.properties, 'value');
    const isNew = this.props.properties.value !== this.state.value;
    if (hasValue && isNew) {
      this.setState({
        value: this.props.properties.value
      }, () => {
        this.triggerValidate();
      });
    }
  }

  triggerValidate() {
    const { validations: validationsProps } = this.props;
    const { validations: validationsState, value } = this.state;

    const validations = validationsState || validationsProps;

    const isValuePresent = (Array.isArray(value)) ? value.length > 0 : value;
    let valid;
    let error;

    // Check if it has validations &&
    //       if a value is defined ||
    //       if required validation is present
    if (validations && (isValuePresent || validations.indexOf('required') !== -1)) {
      const validateArr = this.validator.validate(validations, value);
      valid = validateArr.every(element => element.valid);
      error = (!valid) ? validateArr.map(element => element.error) : [];
    } else {
      valid = (isValuePresent) ? true : null;
      error = [];
    }

    // Save the valid and the error in the state
    this.setState({
      valid,
      error
    }, () => {
      if (this.props.onValid) this.props.onValid(valid, error);
    });
  }

  isValid() {
    return this.state.valid;
  }
}

FormElement.propTypes = {
  properties: PropTypes.object.isRequired,
  validations: PropTypes.array,
  onValid: PropTypes.func,
  intl: intlShape.isRequired
};

export default FormElement;
