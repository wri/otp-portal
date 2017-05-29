import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function Spinner({ isLoading, className }) {
  const classNames = classnames(
    'c-spinner', {
      [className]: !!className,
      '-loading': isLoading
    });

  return (
    <div className={classNames}>
      <div className="spinner-box">
        <div className="icon" />
      </div>
    </div>
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool
};
