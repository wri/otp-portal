import React from 'react';
import PropTypes from 'prop-types';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedDocumentation } from 'selectors/countries-detail/documentation';

// Redux
import { connect } from 'react-redux';
import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getOperators } from 'modules/operators';
import { getCountry } from 'modules/countries-detail';
import withTracker from 'components/layout/with-tracker';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Spinner from 'components/ui/spinner';

import CountriesDetailDocumentation from 'components/countries-detail/documentation';

class CountriesDetail extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const url = { asPath, pathname, query };
    const { operators } = store.getState();
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

    await store.dispatch(getCountry(url.query.id));

    return { isServer, url };
  }

  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    // Set discalimer
    if (!Cookies.get('country-detail.disclaimer')) {
      toastr.info(
        'Info',
        this.props.intl.formatMessage({ id: 'country-detail.disclaimer' }),
        {
          className: '-disclaimer',
          position: 'bottom-right',
          timeOut: 15000,
          onCloseButtonClick: () => {
            Cookies.set('country-detail.disclaimer', true);
          }
        }
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const { url } = this.props;
    const { url: nextUrl } = nextProps;

    if (url.query.id !== nextUrl.query.id) {
      this.props.getCountry(nextUrl.query.id);
    }
  }


  render() {
    const { url, countriesDetail, countryDocumentation } = this.props;

    return (
      <Layout
        title={countriesDetail.data.name || '-'}
        description="Country description..."
        url={url}
      >
        <Spinner isLoading={countriesDetail.loading} className="-fixed" />

        <StaticHeader
          title={countriesDetail.data.name || '-'}
          // subtitle={this.props.intl.formatMessage({ id: 'country.subtitle' }, {
          //   rank: countriesDetail.data['country-doc-rank'],
          //   rankCount: countriesDetail.data['country-operators'],
          //   country: !!countriesDetail.data.country && countriesDetail.data.country.name
          // })}
          background="/static/images/static-header/bg-operator-detail.jpg"
        />

        <CountriesDetailDocumentation
          countriesDetail={countriesDetail}
          countryDocumentation={countryDocumentation}
          url={url}
        />
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
    countriesDetail: state.countriesDetail,
    countryDocumentation: getParsedDocumentation(state)
  }),
  { getCountry }
)(CountriesDetail)));
