/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

import { sortBy } from 'utils/general';

import Html from 'components/html';

// Intl
import { useIntl } from 'react-intl';

function CountriesDetailOverview({ country, links: allLinks, vpas: allVpas }) {
  const intl = useIntl();

  const vpas = sortBy(allVpas, 'position');
  const links = sortBy(allLinks, 'position');

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        {country.overview && <Html html={country.overview} className="georgia" /> }

        {(vpas || []).length > 0 && (
          <article className="c-article">
            <header>
              <h2 className="c-title -extrabig">
                {intl.formatMessage({ id: 'country-detail.vpas.title' })}
              </h2>
            </header>

            <div className="content">
              <ul>
                {vpas.map(link => (
                  <li
                    key={link.id}
                  >
                    <a target="_blank" href={link.url} rel="noopener noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        )}

        {(links || []).length > 0 && (
          <article className="c-article">
            <header>
              <h2 className="c-title -extrabig">
                {intl.formatMessage({ id: 'country-detail.links.title' })}
              </h2>
            </header>

            <div className="content">
              <ul>
                {links.map(link => (
                  <li
                    key={link.id}
                  >
                    <a target="_blank" href={link.url} rel="noopener noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

CountriesDetailOverview.propTypes = {
  country: PropTypes.object.isRequired,
  links: PropTypes.array,
  vpas: PropTypes.array
};

export default CountriesDetailOverview;
