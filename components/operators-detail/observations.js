import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByOperator from 'components/operators-detail/observations/total';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';
import TotalObservationsByOperatorByCategorybyIllegality from 'components/operators-detail/observations/by-category-illegality';

export default class OperatorsDetailObservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: HELPERS_OBS.getMaxYear(props.operatorObservations)
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.operatorObservations !== nextProps.operatorObservations) {
      this.setState({
        year: HELPERS_OBS.getMaxYear(nextProps.operatorObservations)
      });
    }
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
              options={HELPERS_OBS.getYears(this.props.operatorObservations)}
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
