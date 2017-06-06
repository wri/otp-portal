import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class DocCard extends React.Component {

  render() {
    const { date, status, title, fmus } = this.props;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card ${classNames}`}>
        <header className="doc-card-header">
          <div className="doc-card-date">{date}</div>
          <div className="doc-card-status">{status}</div>
        </header>
        <div className="doc-card-content">
          <h3 className="doc-card-title c-title -big">{title}</h3>
          <div className="doc-card-fmus">{fmus} FMUS</div>
        </div>
      </div>
    );
  }
}

DocCard.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string,
  fmus: PropTypes.number
};
