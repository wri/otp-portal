import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Selectors
import { getParsedDocumentation } from 'selectors/countries-detail/documentation';
import { getParsedObservations } from 'selectors/countries-detail/observations';

// Redux
import { connect } from 'react-redux';
import { getCountry, getCountryLinks, getCountryVPAs } from 'modules/countries-detail';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

import CountriesDetailOverview from 'components/countries-detail/overview';
import CountriesDetailDocumentation from 'components/countries-detail/documentation';

const TABS_COUNTRIES_DETAIL = [
  {
    label: 'overview',
    value: 'overview'
  },
  {
    label: 'vpas-documentation',
    value: 'documentation'
  }
];

class CountriesDetail extends React.Component {
  static async getInitialProps({ url, store }) {
    const { countriesDetail } = store.getState();
    const requests = [];

    if (countriesDetail.data.id !== url.query.id) {
      requests.push(store.dispatch(getCountry(url.query.id)));
      requests.push(store.dispatch(getCountryLinks(url.query.id)));
      requests.push(store.dispatch(getCountryVPAs(url.query.id)));
    }

    await Promise.all(requests);

    return { url };
  }

  componentDidUpdate(prevProps) {
    const { url } = prevProps;
    const { url: nextUrl } = this.props;

    if (url.query.id !== nextUrl.query.id) {
      this.props.getCountry(nextUrl.query.id);
    }
  }

  /**
   * HELPERS
   * - getTabOptions
  */
  getTabOptions() {
    return TABS_COUNTRIES_DETAIL.map((tab) => {
      return {
        ...tab,
        label: this.props.intl.formatMessage({ id: tab.label })
      };
    });
  }

  render() {
    const { url, countriesDetail, countryDocumentation, countryObservations } = this.props;
    const id = url.query.id;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title={countriesDetail.data.name || '-'}
        description="Country description..."
        url={url}
      >
        <Spinner isLoading={countriesDetail.loading} className="-fixed" />

        <StaticHeader
          title={countriesDetail.data.name || '-'}
          background="/static/images/static-header/bg-operator-detail.jpg"
        />

        <Tabs
          href={{
            pathname: url.pathname,
            query: { id },
            as: `/countries/${id}`
          }}
          options={this.getTabOptions()}
          selected={tab}
        />

        {tab === 'overview' &&
          <CountriesDetailOverview
            countriesDetail={countriesDetail}
            countryDocumentation={countryDocumentation}
            countryObservations={countryObservations}
            url={url}
          />
        }
        {tab === 'documentation' &&
          <CountriesDetailDocumentation
            vpaOverview={countriesDetail.data['vpa-overview']}
            countryDocumentation={countryDocumentation}
            url={url}
          />
        }
      </Layout>
    );
  }

}

CountriesDetail.propTypes = {
  url: PropTypes.object.isRequired,
  countriesDetail: PropTypes.shape({}).isRequired,
  countryDocumentation: PropTypes.shape({}).isRequired,
  countryObservations: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired,

  getCountry: PropTypes.func.isRequired
};

export default injectIntl(connect(

  state => ({
    user: state.user,
    countriesDetail: state.countriesDetail,
    countryDocumentation: getParsedDocumentation(state),
    countryObservations: getParsedObservations(state)
  }),
  { getCountry }
)(CountriesDetail));
