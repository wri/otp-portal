import React, { PureComponent } from 'react';
import classnames from 'classnames';

class DatepickerInput extends PureComponent {
  state = {
    focus: false
  }

  button = React.createRef();

  componentDidMount() {
    if (this.props.autoFocus) this.button.current.focus();
  }

  onFocus = (e) => {
    const { onFocus } = this.props;

    this.setState({ focus: true });
    onFocus(e);
  }

  onBlur = (e) => {
    const { onBlur } = this.props;

    this.setState({ focus: false });
    onBlur(e);
  }

  render () {
    // label (formatted by the wrapper) wins over react-datepicker's own date-fns value
    const { label, value, onClick } = this.props;
    const { focus } = this.state;

    return (
      <button
        ref={this.button}
        className={classnames({
          "c-datepicker-input": true,
          "-focus": focus
        })}
        onClick={onClick}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        {label ?? value}
      </button>
    )
  }
}

export default DatepickerInput;