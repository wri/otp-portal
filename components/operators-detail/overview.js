/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Gallery1 from 'components/operators-detail/overview/gallery-1';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

function OperatorsDetailOverview(props) {
  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 {...props} />

        <article className="c-article">
          <div className="row l-row">
            <div className="columns small-12 medium-8">
              <header>
                <h2 className="c-title">
                  {props.intl.formatMessage({ id: 'overview' })}
                </h2>
              </header>
              <div className="content">
                <div className="description">
                  <p>
                    Text presenting the Forest Operator and describing its activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CHARTS */}
        <article className="c-article">
          <header>
            <h2 className="c-title">
              {props.intl.formatMessage({ id: 'observations_by_category' })}
            </h2>
          </header>

          <div className="content">
            <TotalObservationsByOperatorByCategory data={props.operatorObservations} />
          </div>
        </article>
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  operatorObservations: PropTypes.array,
  intl: intlShape.isRequired
};


export default injectIntl(OperatorsDetailOverview);
