import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class Field extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.properties.default,
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

    // // React intl forces to do this...
    // // I'm starting to think that our inputs are not very well done...
    // if (this.child.getWrappedInstance) {
    //   const wrapper = this.child.getWrappedInstance();
    //   if (wrapper) wrapper.triggerValidate();
    // }
  }

  isValid() {
    return this.state.valid;
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

  render() {
    const { properties, className, hint } = this.props;
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
            {properties.label} {properties.required && <abbr title="required">*</abbr>}
          </label>
        }

        {this.renderHint()}

        <this.props.children
          {...this.props}
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
  className: PropTypes.string
};

export default Field;
