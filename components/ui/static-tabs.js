import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function Tabs({ options, defaultSelected, onChange }) {
  const [selected, setSelected] = React.useState(defaultSelected);

  const triggerClickSelected = (value) => {
    setSelected(value);
    onChange && onChange(value);
  };

  return (
    <header className="c-static-tabs">
      <div className="l-container">
        <div className="row l-row">
          {options.map((option) => {
            const btnClasses = classnames({
              '-active': option.value === selected
            });

            return (
              <div
                key={option.value}
                className="shrink columns"
              >
                <button
                  className={`tabs-btn ${btnClasses}`}
                  onClick={() => triggerClickSelected(option.value)}
                >
                  <span className="title">{option.label}</span>
                  {!!option.number && <span className="number">{option.number}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}

Tabs.propTypes = {
  options: PropTypes.array.isRequired,
  defaultSelected: PropTypes.string,
  onChange: PropTypes.func
};
