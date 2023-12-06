import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next components
import Link from 'next/link';

export default function Tabs({ options, selected, href }) {
  useEffect(() => {
    const element = document.querySelector(`.tabs-btn.-active`);
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
    }
  }, []);

  return (
    <header className="c-tabs">
      <div className="l-container">
        <div className="row l-row">
          {options.map((option) => {
            const btnClasses = classnames({
              '-active': option.value === selected,
              '-number': !!option.number || option.number === 0
            });

            return (
              <div
                key={option.value}
                className="column"
              >
                <Link
                  href={{
                    pathname: href.pathname,
                    query: {
                      ...href.query,
                      tab: option.value
                    }
                  }}
                  as={`${href.as}/${option.value}`}
                  prefetch={false}
                >
                  <a className={`tabs-btn ${btnClasses}`}>
                    <span className="title">{option.label}</span>
                    {(!!option.number || option.number === 0) && <span className="number">{option.number}</span>}
                  </a>
                </Link>
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
  href: PropTypes.object.isRequired,
  selected: PropTypes.string.isRequired
};
