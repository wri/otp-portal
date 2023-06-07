import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function Tabs({ options, selected, defaultSelected, onChange }) {
  const [innerSelected, setInnerSelected] = React.useState(defaultSelected);
  const selectedTab = selected !== undefined ? selected : innerSelected;

  const triggerClickSelected = (value) => {
    setInnerSelected(value);
    onChange && onChange(value);
  };

  return (
    <header className="c-static-tabs">
      <div className="l-container">
        <div className="row l-row">
          {options.map((option) => {
            const btnClasses = classnames({
              '-active': option.value === selectedTab
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
  selected: PropTypes.string,
  defaultSelected: PropTypes.string,
  onChange: PropTypes.func
};
