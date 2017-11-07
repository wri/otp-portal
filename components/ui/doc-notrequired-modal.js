import React from 'react';
import PropTypes from 'prop-types';

class DocNotRequiredModal extends React.Component {
  render() {
    return (
      <div className="c-doc-notrequired-modal">
        <h2>{this.props.title}</h2>
        <p>
          {this.props.reason}
        </p>
      </div>
    );
  }
}

DocNotRequiredModal.propTypes = {
  title: PropTypes.string,
  reason: PropTypes.string
};


export default DocNotRequiredModal;
