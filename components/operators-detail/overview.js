/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

// Constants
import { OBSERVATIONS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Gallery1 from 'components/operators-detail/overview/gallery-1';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

export default function OperatorsDetailOverview(props) {
  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 />
        <article className="c-article">
          <div className="row custom-row">
            <div className="columns small-12 medium-8">
              <header>
                <h2 className="c-title">Overview</h2>
              </header>
              <div className="content">
                <div className="description">
                  <p>REM is a non-profit organisation that operates as Independent Monitor of Law Enforcement and Governance. Our mission is to stimulate government reform and action in natural resource extraction through independent monitoring and credible reporting of illegalities and related governance problems. We use this information to develop, with the concerned actors, constructive and viable solutions and assist in their implementation.</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CHARTS */}
        <article className="c-article">
          <header>
            <h2 className="c-title">Observations by category</h2>
          </header>

          <div className="content">
            <TotalObservationsByOperatorByCategory data={OBSERVATIONS_OPERATORS_DETAIL} />
          </div>
        </article>
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  operatorsDetail: PropTypes.object.isRequired
};
