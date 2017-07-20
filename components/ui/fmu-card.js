import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function FMUCard({ title, theme, fmus }) {
  const classNames = classnames({
    [`-${theme}`]: !!theme
  });

  return (
    <div className={`c-fmu-card ${classNames}`}>
      <div className="card-container">
        {title && <h3 className="card-title">{title}</h3>}
        <ul className="fmu-list">
          {fmus.map(fmu => <li key={fmu.id} className="fmu-item">{fmu.name}</li>)}
        </ul>
      </div>
    </div>
  );
}

FMUCard.propTypes = {
  title: PropTypes.string,
  theme: PropTypes.string,
  fmus: PropTypes.array.isRequired
};
