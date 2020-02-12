import React from 'react';
import PropTypes from 'prop-types';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getOperators } from 'modules/operators';
import { getCountries } from 'modules/countries';
import withTracker from 'components/layout/with-tracker';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Spinner from 'components/ui/spinner';

import CountriesList from 'components/countries/list';

class CountriesDetail extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const { operators } = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let lang = 'en';

    if (isServer) {
      lang = req.locale.language;
      user = req.session ? req.session.user : {};
    } else {
      lang = store.getState().language;
      user = store.getState().user;
    }

    store.dispatch(setLanguage(lang));
    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!operators.data.length) {
      await store.dispatch(getOperators());
    }

    await store.dispatch(getCountries());

    return { isServer, url };
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
  url: PropTypes.shape({}).isRequired,
  countries: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};

export default withTracker(withIntl(connect(

  state => ({
    user: state.user,
    countries: state.countries
  }),
  { getCountries }
)(CountriesDetail)));
