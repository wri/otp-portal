import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

export default function DocCard(props) {
  const { startDate, endDate, status, title } = props;

  const metadata = HELPERS_DOC.getMetadata();

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card ${classNames}`}>
      <header className="doc-card-header">
        {startDate !== endDate &&
          <div className="doc-card-date">{endDate}</div>
        }
        <div className="doc-card-status">{metadata[status].label}</div>
      </header>
      <div className="doc-card-content">
        <h3 className="doc-card-title c-title -big">{title}</h3>
      </div>
    </div>
  );
}

DocCard.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string
};
