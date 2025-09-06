import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

// Selectors
import { getParsedDocumentation } from 'selectors/countries-detail/documentation';

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

function CountriesDetail({ router, countriesDetail, countryDocumentation, getCountry }) {
  const intl = useIntl();
  const id = router.query.id;
  const tab = router.query.tab || 'overview';

  useEffect(() => {
    if (id) {
      getCountry(id);
    }
  }, [id, getCountry]);

  const getTabOptions = () => {
    return TABS_COUNTRIES_DETAIL.map((tab) => {
      return {
        ...tab,
        label: intl.formatMessage({ id: tab.label })
      };
    });
  };

  return (
    <Layout
      title={countriesDetail.data.name || '-'}
      description="Country description..."
    >
      <Spinner isLoading={countriesDetail.loading} className="-fixed" />

      <StaticHeader
        title={countriesDetail.data.name || '-'}
        background="/static/images/static-header/bg-operator-detail.jpg"
      />

      <Tabs
        href={{
          pathname: router.pathname,
          query: { id },
          as: `/countries/${id}`
        }}
        options={getTabOptions()}
        selected={tab}
      />

      {tab === 'overview' &&
        <CountriesDetailOverview countriesDetail={countriesDetail} />
      }
      {tab === 'documentation' &&
        <CountriesDetailDocumentation
          vpaOverview={countriesDetail.data['vpa-overview']}
          countryDocumentation={countryDocumentation}
        />
      }
    </Layout>
  );
}

CountriesDetail.getInitialProps = async ({ query, asPath, store }) => {
  const { id, tab } = query;

  if (process.env.FEATURE_COUNTRY_PAGES !== 'true') {
    return { redirectTo: '/', redirectPermanent: false };
  }

  if (!tab) {
    return { redirectTo: `${asPath}/overview` };
  }

  const { countriesDetail } = store.getState();
  const requests = [];

  if (countriesDetail.data.id !== id) {
    requests.push(store.dispatch(getCountry(id)));
    requests.push(store.dispatch(getCountryLinks(id)));
    requests.push(store.dispatch(getCountryVPAs(id)));
  }

  await Promise.all(requests);

  return {};
};

CountriesDetail.propTypes = {
  router: PropTypes.object.isRequired,
  countriesDetail: PropTypes.shape({}).isRequired,
  countryDocumentation: PropTypes.shape({}).isRequired,
  getCountry: PropTypes.func.isRequired
};

export default withRouter(connect(
  state => ({
    countriesDetail: state.countriesDetail,
    countryDocumentation: getParsedDocumentation(state)
  }),
  { getCountry }
)(CountriesDetail));
