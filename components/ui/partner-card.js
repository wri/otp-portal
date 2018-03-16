import React from 'react';
import PropTypes from 'prop-types';


class PartnerCard extends React.Component {
  static propTypes = {
    logo: PropTypes.object,
    name: PropTypes.string,
    website: PropTypes.string,
    description: PropTypes.string
  };

  render() {
    const { logo, name, website, description } = this.props;

    return (
      <div className="c-partner-card">
        <div className="partner-card-logo-container">
          <a rel="noopener noreferrer" target="_blank" href={website}>
            <h3 className="partner-card-title">{name}</h3>
            <picture>
              {logo.unmodified && <source srcSet={`http://otp-staging.vizzuality.com/${logo.unmodified.url}`} media="(min-width: 640px)" />}
              {logo.unmodified && <img className="partner-card-logo" src={`http://otp-staging.vizzuality.com/${logo.unmodified.url}`} alt={name} />}
            </picture>
          </a>
        </div>
        <div className="partner-card-content">
          <p className="partner-card-text">
            {description}
          </p>
        </div>
      </div>
    );
  }
}

export default PartnerCard;
