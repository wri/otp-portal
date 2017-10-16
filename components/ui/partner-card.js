import React from 'react';
import PropTypes from 'prop-types';

class PartnerCard extends React.Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string
  };

  static defaultProps = {
    logo: '',
    title: '',
    description: '',
    url: ''
  };

  render() {
    const { logo, title, description, url } = this.props;
    return (
      <div className="c-partner-card">
        <a rel="noopener noreferrer" target="_blank" href={url}>
          <div className="partner-card-logo">
            <img alt={title} src={logo} />
          </div>
          <div className="partner-card-content">
            <p>
              {description}
            </p>
          </div>
        </a>
      </div>
    );
  }
}

PartnerCard.propTypes = {
  logo: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string
};

export default PartnerCard;
