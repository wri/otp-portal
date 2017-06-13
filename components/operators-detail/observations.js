import React from 'react';
import groupBy from 'lodash/groupBy';

// Constants
import { OBSERVATIONS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByOperator from 'components/operators-detail/observations/total';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';
import TotalObservationsByOperatorByCategorybyIllegality from 'components/operators-detail/observations/by-category-illegality';

export default class OperatorsDetailObservations extends React.Component {

  /**
   * HELPERS
   * - getYears
  */
  static getYears() {
    const years = Object.keys(groupBy(OBSERVATIONS_OPERATORS_DETAIL, 'year'));
    return years.sort((a, b) => b - a).map(year => ({ label: year, value: year }));
  }

  static getMaxYear() {
    const years = Object.keys(groupBy(OBSERVATIONS_OPERATORS_DETAIL, 'year'));
    return Math.max(...years);
  }

  constructor(props) {
    super(props);

    this.state = {
      year: OperatorsDetailObservations.getMaxYear()
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  /**
   * UI EVENTS
   * - onChangeYear
  */
  onChangeYear(year) {
    this.setState({ year });
  }

  render() {
    return (
      <div
        className="c-section"
      >
        <article className="c-article">
          <div className="l-container">
            <header>
              <h2 className="c-title">Observations from independent monitors</h2>
            </header>
            <div className="content">
              <TotalObservationsByOperator data={OBSERVATIONS_OPERATORS_DETAIL} />
            </div>
          </div>
        </article>

        <article className="c-article">
          <div className="l-container">
            <header>
              <h2 className="c-title">Observations by category</h2>
            </header>
          </div>

          <div className="content">
            <StaticTabs
              options={OperatorsDetailObservations.getYears()}
              defaultSelected={this.state.year.toString()}
              onChange={this.onChangeYear}
            />

            <div className="l-container">
              <div className="content">
                {/* CHARTS */}
                <article className="c-article">
                  <TotalObservationsByOperatorByCategory
                    data={OBSERVATIONS_OPERATORS_DETAIL}
                    year={parseInt(this.state.year, 10)}
                  />
                </article>
              </div>
            </div>
          </div>
        </article>

        <article className="c-article">
          <div className="l-container">
            <TotalObservationsByOperatorByCategorybyIllegality
              data={OBSERVATIONS_OPERATORS_DETAIL}
              year={parseInt(this.state.year, 10)}
            />
          </div>
        </article>

      </div>
    );
  }
}

OperatorsDetailObservations.propTypes = {
};
