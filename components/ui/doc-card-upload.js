import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function DocCardUpload(props) {
  const { date, status, title } = props;

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card-upload ${classNames}`}>
      {(status === 'doc_valid' || status === 'doc_invalid') &&
        <ul>
          <li>
            <button className="c-button -primary">
              Update file
            </button>
          </li>

          <li>
            <button className="c-button -primary">
              Delete
            </button>
          </li>
        </ul>
      }
      {status === 'doc_not_provided' &&
        <ul>
          <li>
            <button className="c-button -secondary">
              Add file
            </button>
          </li>
        </ul>
      }

    </div>
  );
}

DocCardUpload.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string
};
