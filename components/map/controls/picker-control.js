import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from 'components/ui/icon';

class PickerControl extends React.Component {
  static propTypes = {
    pickerMode: PropTypes.bool,
    setMarkerMode: PropTypes.func
  };

  setMarkerMode() {
    this.props.setMarkerMode(!this.props.pickerMode);
  }

  render() {
    const { pickerMode } = this.props;

    const classNames = classnames({
      '-active': pickerMode
    });

    return (
      <div className="c-picker-control">
        <button
          onClick={() => this.setMarkerMode()}
          className={classNames}
          type="button"
        >
          <Icon name="icon-location" />
        </button>

      </div>
    );
  }
}

export default PickerControl;
