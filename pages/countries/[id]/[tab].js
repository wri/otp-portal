import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

import { fetchApi, settle, CONTENT_MAX_AGE } from 'services/fetch-api';
import { parseCountryDocumentation } from 'components/countries-detail/documents';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

import CountriesDetailOverview from 'components/countries-detail/overview';
import CountriesDetailDocumentation from 'components/countries-detail/documentation';
import { useDownloadSession } from 'hooks/use-download-session';
import useUser from 'hooks/use-user';

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

const COUNTRY_INCLUDE = [
  'governments',
  'required-gov-documents',
  'required-gov-documents.required-gov-document-group',
  'required-gov-documents.required-gov-document-group.parent',
  'required-gov-documents.gov-documents'
].join(',');

function fetchCountry(id, language, cache = CONTENT_MAX_AGE) {
  return fetchApi(`countries/${id}`, { locale: language, auth: true, cache, params: { include: COUNTRY_INCLUDE } });
}

function CountriesDetail({ country, links, vpas }) {
  const router = useRouter();
  const intl = useIntl();
  const id = router.query.id;
  const tab = router.query.tab || 'overview';
  const user = useUser();
  useDownloadSession(user.isLoggedIn);

  const [reloaded, setReloaded] = useState(null);
  const [loading, setLoading] = useState(false);
  // after a document change; the cache has the same copy for the next getInitialProps
  const countryData = reloaded && reloaded.id === country.data.id ? reloaded : country.data;
  const countryDocumentation = useMemo(() => parseCountryDocumentation(countryData), [countryData]);

  const reloadCountry = () => {
    setLoading(true);
    fetchCountry(id, intl.locale, 'reload')
      .then(setReloaded, console.error)
      .finally(() => setLoading(false));
  };

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
      title={countryData.name || '-'}
      description="Country description..."
    >
      <Spinner isLoading={loading} className="-fixed" />

      <StaticHeader
        title={countryData.name || '-'}
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
        <CountriesDetailOverview country={countryData} links={links.data} vpas={vpas.data} />
      }
      {tab === 'documentation' &&
        <CountriesDetailDocumentation
          vpaOverview={countryData['vpa-overview']}
          countryDocumentation={countryDocumentation}
          onDocumentChange={reloadCountry}
        />
      }
    </Layout>
  );
}

CountriesDetail.getInitialProps = async ({ query, asPath, language }) => {
  const { id, tab } = query;

  if (process.env.FEATURE_COUNTRY_PAGES !== 'true') {
    return { redirectTo: '/', redirectPermanent: false };
  }

  if (!tab) {
    return { redirectTo: `${asPath}/overview` };
  }

  const load = (endpoint) => settle(fetchApi(endpoint, { locale: language, auth: true, cache: CONTENT_MAX_AGE, params: { country: id } }), []);
  const [country, links, vpas] = await Promise.all([
    settle(fetchCountry(id, language), {}),
    load('country-links'),
    load('country-vpas')
  ]);

  return { country, links, vpas };
};

CountriesDetail.propTypes = {
  country: PropTypes.shape({ data: PropTypes.object }).isRequired,
  links: PropTypes.shape({ data: PropTypes.array }).isRequired,
  vpas: PropTypes.shape({ data: PropTypes.array }).isRequired
};

export default CountriesDetail;
