import React from 'react';
import PropTypes from 'prop-types';

class PartnerCard extends React.Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,
    maxWidth: PropTypes.string
  };

  static defaultProps = {
    logo: '',
    title: '',
    description: '',
    url: '',
    maxWidth: ''
  };

  render() {
    const { logo, title, description, url, maxWidth } = this.props;
    return (
      <div className="c-partner-card">
        <div className="partner-card-logo">
          <a rel="noopener noreferrer" target="_blank" href={url}>
            <h3>{title}</h3>
            <img style={{ maxWidth }} alt={title} src={logo} />
          </a>
        </div>
        <div className="partner-card-content">
          <p>
            {description}
          </p>
        </div>
      </div>
    );
  }
}

export default PartnerCard;
