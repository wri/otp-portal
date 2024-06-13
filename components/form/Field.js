import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { withFormContext } from './Form';

class Field extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      valid: null,
      error: []
    };

    // BINDINGS
    this.onValid = this.onValid.bind(this);
  }

  /**
   * UI EVENTS
   * - onValid (valid, error)
  */
  onValid(valid, error) {
    this.setState({
      valid,
      error
    });
  }

  validate() {
    if (this.child.triggerValidate) this.child.triggerValidate();
  }

  isValid() {
    return this.state.valid;
  }

  getElementProps() {
    const { properties, onChange, formContext } = this.props;

    const defaultOnChange = (value) => {
      if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, 'checked')) {
        formContext.setFormValues({ [properties.name]: value.checked });
      } else {
        formContext.setFormValues({ [properties.name]: value });
      }
    };

    return {
      ...this.props,
      onChange: onChange || defaultOnChange,
      properties: {
        ...properties,
        default: typeof properties.default !== 'undefined' ? properties.default : formContext.form[properties.name],
      }
    };
  }

  renderHint() {
    const { hint } = this.props;

    if (!hint) return null;
    if (typeof hint === 'string') {
      return (
        <p className="hint" dangerouslySetInnerHTML={{ __html: hint }} />
      )
    }
    if (typeof hint === 'function') {
      return (
        <p className="hint">{hint()}</p>
      )
    }

    return (
      <p className="hint">{hint}</p>
    )
  }

  renderLabel() {
    const { properties } = this.props;
    if (!properties.label) return null;

    if (typeof properties.label === 'function') {
      return properties.label();
    }

    return properties.label
  }

  render() {
    const { properties, className } = this.props;
    const { valid, error } = this.state;

    // Set classes
    const fieldClasses = classnames({
      [className]: !!className,
      '-disabled': properties.disabled,
      '-valid': (valid === true),
      '-error': (valid === false)
    });

    return (
      <div className={`c-field ${fieldClasses}`}>
        {properties.label &&
          <label htmlFor={`input-${properties.name}`} className="label">
            {this.renderLabel()} {properties.required && <abbr title="required">*</abbr>}
          </label>
        }

        {this.renderHint()}

        <this.props.children
          {...this.getElementProps()}
          ref={(c) => { if (c) this.child = c; }}
          onValid={this.onValid}
        />

        {error && Array.isArray(error) &&
          error.map((err, i) => {
            if (err) {
              return (
                <p key={i} className="error">
                  {err.message || err.detail}
                </p>
              );
            }
            return null;
          })
        }

      </div>
    );
  }
}

Field.propTypes = {
  properties: PropTypes.object.isRequired,
  hint: PropTypes.string,
  className: PropTypes.string,
  formContext: PropTypes.object
};

export default withFormContext(Field);
