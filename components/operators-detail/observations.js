import React from 'react';

// Constants
import { OBSERVATIONS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import TotalObservationsByOperator from 'components/operators-detail/observations/total';

export default class OperatorsDetailObservations extends React.Component {
  render() {
    return (
      <div
        className="c-section"
      >
        <div className="l-container">
          <article className="c-article">
            <header>
              <h2 className="c-title">Observations from independent monitors</h2>
            </header>
            <div className="content">
              <TotalObservationsByOperator data={OBSERVATIONS_OPERATORS_DETAIL} />
            </div>
          </article>

          <article className="c-article">
            <header>
              <h2 className="c-title">Observations by category</h2>
            </header>
            <div className="content">

            </div>
          </article>
        </div>
      </div>
    );
  }
}

OperatorsDetailObservations.propTypes = {
};
