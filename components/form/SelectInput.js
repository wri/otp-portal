import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { injectIntl } from 'react-intl';

import FormElement from './FormElement';

class SelectInput extends FormElement {
  constructor(props) {
    super(props);

    this.state = {
      value: props.properties.default || null
    };
  }

  /**
   * UI EVENTS
   * - triggerChange
  */
  triggerChange(selected) {
    let value;

    if (Array.isArray(selected)) {
      value = (selected) ? selected.map(s => s.value) : null;
    } else {
      value = (selected) ? selected.value : null;
    }

    this.setState({ value }, () => {
      // Trigger validation
      this.triggerValidate();
      // Publish the new value to the form
      if (this.props.onChange) this.props.onChange(this.state.value);
    });
  }

  render() {
    const { options, properties } = this.props;
    const { isMulti } = properties;
    let value;
    if (isMulti) {
      value = this.state.value ? options.filter(o => this.state.value.includes(o.value)) : null;
    } else {
      value = options.filter(o => o.value === this.state.value);
    }

    if (properties.creatable) {
      return (
        <CreatableSelect
          className='react-select-container'
          classNamePrefix='react-select'
          {...properties}
          options={options}
          id={`select-${properties.name}`}
          value={value}
          onChange={this.triggerChange}
        />
      );
    }

    return (
      <Select
        className='react-select-container'
        classNamePrefix='react-select'
        {...properties}
        options={options}
        id={`select-${properties.name}`}
        value={value}
        onChange={this.triggerChange}
      />
    );
  }
}

SelectInput.defaultProps = {
  options: []
};

SelectInput.propTypes = {
  properties: PropTypes.object.isRequired,
  options: PropTypes.array,
  creatable: PropTypes.bool,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any
};

export default injectIntl(SelectInput, {forwardRef: true});
