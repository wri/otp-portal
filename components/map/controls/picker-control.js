import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from 'components/ui/icon';

const PickerControl = ({ pickerMode, setMarkerMode }) => {
  const handleMarkerMode = () => {
    setMarkerMode(!pickerMode);
  };

  const classNames = classnames({
    '-active': pickerMode
  });

  return (
    <div className="c-picker-control">
      <button
        onClick={handleMarkerMode}
        className={classNames}
        type="button"
      >
        <Icon name="icon-location" />
      </button>
    </div>
  );
};

PickerControl.propTypes = {
  pickerMode: PropTypes.bool,
  setMarkerMode: PropTypes.func
};

export default PickerControl;
