import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import CountryCard from 'components/ui/country-card';

class CountriesList extends React.Component {
  render() {
    const { data } = this.props;

    return (
      <div className="c-countries-list">
        <h2 className="c-title">Select a country</h2>

        <div className="row l-row -equal-heigth">
          {data.map(country => (
            <div className="columns small-12 medium-4">
              <CountryCard
                {...country}
              />
            </div>
          ))}
        </div>

      </div>
    );
  }
}

CountriesList.defaultProps = {
  data: [],
  loading: false
};

CountriesList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool
};

export default connect(
  state => ({
    ...state.countries
  })
)(CountriesList);
