import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByOperator from 'components/operators-detail/observations/total';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';
import TotalObservationsByOperatorByCategorybyIllegality from 'components/operators-detail/observations/by-category-illegality';

export default class OperatorsDetailObservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: this.getMaxYear()
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.operatorObservations !== nextProps.operatorObservations) {
      this.getMaxYear();
    }
  }

  /**
   * UI EVENTS
   * - onChangeYear
  */
  onChangeYear(year) {
    this.setState({ year });
  }

  /**
   * HELPERS
   * - getYears
  */
  getYears() {
    const years = Object.keys(groupBy(this.props.operatorObservations, d => d.date.getFullYear()));
    return years.sort((a, b) => b - a).map(year => ({ label: year, value: year }));
  }

  getMaxYear() {
    const years = Object.keys(groupBy(this.props.operatorObservations, d => d.date.getFullYear()));
    return Math.max(...years);
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
              <TotalObservationsByOperator data={this.props.operatorObservations} />
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
              options={this.getYears()}
              defaultSelected={this.state.year.toString()}
              onChange={this.onChangeYear}
            />

            <div className="l-container">
              <div className="content">
                {/* CHARTS */}
                <article className="c-article">
                  <TotalObservationsByOperatorByCategory
                    data={this.props.operatorObservations}
                    year={parseInt(this.state.year, 10)}
                  />
                </article>
              </div>
            </div>
          </div>
        </article>

        <article className="c-article">
          <TotalObservationsByOperatorByCategorybyIllegality
            data={this.props.operatorObservations}
            year={parseInt(this.state.year, 10)}
          />
        </article>

      </div>
    );
  }
}

OperatorsDetailObservations.propTypes = {
  operatorObservations: PropTypes.array
};
