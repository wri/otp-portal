import React from 'react';
import PropTypes from 'prop-types';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { getCountries } from 'modules/countries';
import withTracker from 'components/layout/with-tracker';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Spinner from 'components/ui/spinner';

import CountriesList from 'components/countries/list';

class CountriesDetail extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    this.props.getCountries();
  }

  render() {
    const { url, countries } = this.props;

    return (
      <Layout
        title="Countries"
        description="Countries description..."
        url={url}
      >
        <Spinner isLoading={countries.loading} className="-fixed" />

        <StaticHeader
          title="Countries"
          // subtitle={this.props.intl.formatMessage({ id: 'country.subtitle' }, {
          //   rank: countriesDetail.data['country-doc-rank'],
          //   rankCount: countriesDetail.data['country-operators'],
          //   country: !!countriesDetail.data.country && countriesDetail.data.country.name
          // })}
          background="/static/images/static-header/bg-operator-detail.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <CountriesList />
          </div>
        </div>

      </Layout>
    );
  }

}

CountriesDetail.propTypes = {
  url: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default withTracker(withIntl(connect(

  state => ({
    user: state.user,
    countries: state.countries
  }),
  { getCountries }
)(CountriesDetail)));
