import React from 'react';
import PropTypes from 'prop-types';

const PartnerCard = ({ logo, name, website, description }) => {
  return (
    <div className="c-partner-card">
      <div className="partner-card-logo-container">
        <a rel="noopener noreferrer" target="_blank" href={website}>
          <h3 className="partner-card-title">{name}</h3>
          <picture>
            {logo.unmodified && <source srcSet={logo.unmodified.url} media="(min-width: 640px)" />}
            {logo.unmodified && <img className="partner-card-logo" src={logo.unmodified.url} alt={name} />}
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
};

PartnerCard.propTypes = {
  logo: PropTypes.object,
  name: PropTypes.string,
  website: PropTypes.string,
  description: PropTypes.string
};

export default PartnerCard;
