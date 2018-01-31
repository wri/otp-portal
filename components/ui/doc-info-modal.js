import React from 'react';
import PropTypes from 'prop-types';

function DocInfoModal(props) {
  return (
    <div className="c-doc-notrequired-modal">
      <h2>{props.title}</h2>
      <p>
        {props.explanation}
      </p>
    </div>
  );
}

DocInfoModal.propTypes = {
  title: PropTypes.string,
  explanation: PropTypes.string
};


export default DocInfoModal;
