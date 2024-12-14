import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSpinDelay } from 'spin-delay';

export default function Spinner({ isLoading, className, spinDelay = 500, spinMinDuration = 300 }) {
  const classNames = classnames({
    [className]: !!className,
  });
  const showSpinner = useSpinDelay(isLoading, { delay: spinDelay, minDuration: spinMinDuration, ssr: false });

  if (!showSpinner) return null;

  return (
    <div className={`c-spinner ${classNames}`}>
      <div className="spinner-box">
        <div className="icon" />
      </div>
    </div>
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  spinDelay: PropTypes.number,
  spinMinDuration: PropTypes.number
};
