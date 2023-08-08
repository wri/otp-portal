/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

import sortBy from 'lodash/sortBy';

import Html from 'components/html';

// Intl
import { useIntl } from 'react-intl';

function CountriesDetailOverview({ countriesDetail }) {
  const intl = useIntl();

  const vpas = sortBy(countriesDetail.vpas.data, 'position');
  const links = sortBy(countriesDetail.links.data, 'position');

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        {countriesDetail.data.overview && <Html html={countriesDetail.data.overview} className="georgia" /> }

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
  countriesDetail: PropTypes.object
};

export default CountriesDetailOverview;
