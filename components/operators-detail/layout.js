import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';
import { useRouter } from 'next/router';

// Utils
import { HELPERS_DOC, getTodayDate } from 'utils/documentation';

// Intl
import { useIntl } from 'react-intl';

import { settle } from 'services/fetch-api';
import {
  fetchOperator,
  fetchOperatorBySlug,
  fetchOperatorDocumentation,
  fetchOperatorObservations,
  fetchOperatorPublicationAuthorization,
  fetchOperatorTimeline
} from 'services/operators';
import { parseObservations } from 'services/observations';
import { parseOperatorDocuments, getHistoricFmus } from 'components/operators-detail/documents';

import Link from 'next/link';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';
import useUser from 'hooks/use-user';

const TABS_OPERATORS_DETAIL = [{
  label: 'overview',
  value: 'overview'
}, {
  label: 'documentation',
  value: 'documentation'
}, {
  label: 'observations',
  value: 'observations'
}, {
  label: 'operator-detail.tabs.fmus',
  value: 'fmus'
}];

const COUNTRIES_FRENCH_FIX = {
  'CMR': 'au', // Cameroon
  'GAB': 'au', // Gabon
};

const OperatorDetailContext = createContext(null);

// The operator the tabs show, its documents for ?date= and ?fmuId=, and refetching after an edit
export const useOperatorDetail = () => useContext(OperatorDetailContext);

const NOTHING = { data: [] };

// shared getInitialProps for operator's detail pages
export async function getInitialProps({ query, asPath, user, language }) {
  const { id } = query;
  const tab = asPath.split('/').pop().split('?')[0];
  const options = { locale: language };

  // we are going to redirect to slug if the id is a number
  if (!isNaN(id)) {
    const operator = await fetchOperator(id, options).catch(() => null);

    if (!operator || isEmpty(operator)) {
      return { statusCode: 404 };
    }
    return { redirectTo: asPath.replace(`/${id}`, `/${operator.slug}`) };
  }

  const operator = await fetchOperatorBySlug(id, options).catch(() => null);
  if (!operator || isEmpty(operator)) {
    return { statusCode: 404 };
  }

  const onDocumentation = tab === 'documentation';
  // match the date the client computes on mount, otherwise the first paint
  // shows another day's documents and is immediately refetched
  const date = query.date || getTodayDate();
  const canManage = user.user_id && (user.role === 'admin' || (user.operator_ids || []).includes(+operator.id));

  const [documentation, timeline, publicationAuthorization, observations] = await Promise.all([
    onDocumentation ? settle(fetchOperatorDocumentation(operator.id, date, options), []) : NOTHING,
    onDocumentation ? settle(fetchOperatorTimeline(operator.id, options), []) : NOTHING,
    onDocumentation && canManage ? fetchOperatorPublicationAuthorization(operator.id, options).catch(() => null) : null,
    tab === 'observations' || tab === 'overview' ? settle(fetchOperatorObservations(operator.id, options), []) : NOTHING
  ]);

  return {
    operatorsDetail: {
      data: operator,
      documentation: { data: documentation.data, date: onDocumentation ? date : null },
      timeline: { data: timeline.data },
      observations: { data: observations.data },
      publicationAuthorization
    }
  };
}

function useOperatorDetailState(initial) {
  const intl = useIntl();
  const router = useRouter();
  const user = useUser();
  const locale = intl.locale;

  // page props win again whenever getInitialProps produced new ones
  const [shown, setShown] = useState(initial);
  const [detail, setDetail] = useState(initial);
  if (shown !== initial) {
    setShown(initial);
    setDetail(initial);
  }
  const [loading, setLoading] = useState(false);

  const operator = detail.data;
  const tab = router.pathname.split('/').pop();
  const date = router.query.date || getTodayDate();

  // the date picker changes ?date= shallowly, so getInitialProps does not run for it
  useEffect(() => {
    if (tab !== 'documentation' || detail.documentation.date === date) return undefined;

    let current = true;
    fetchOperatorDocumentation(operator.id, date, { locale }).then((data) => {
      if (current) setDetail((d) => ({ ...d, documentation: { data, date } }));
    }, console.error);
    return () => { current = false; };
  }, [tab, date, operator.id, detail.documentation.date, locale]);

  const reload = () => {
    const options = { locale, cache: 'reload' };
    setLoading(true);
    Promise.all([
      fetchOperatorBySlug(operator.slug, { ...options, loadFmus: !!operator.loadedFMUS }),
      fetchOperatorDocumentation(operator.id, date, options),
      fetchOperatorTimeline(operator.id, options),
      user.canManageOperator(operator.id)
        ? fetchOperatorPublicationAuthorization(operator.id, options).catch(() => null)
        : detail.publicationAuthorization
    ])
      .then(([data, documentation, timeline, publicationAuthorization]) => setDetail((d) => ({
        ...d,
        data,
        documentation: { data: documentation, date },
        timeline: { data: timeline },
        publicationAuthorization
      })), console.error)
      .finally(() => setLoading(false));
  };

  const loadFmus = () => fetchOperatorBySlug(operator.slug, { locale, loadFmus: true })
    .then((data) => setDetail((d) => (d.data.slug === data.slug ? { ...d, data } : d)), console.error);

  const fmus = useMemo(() => getHistoricFmus(detail.documentation.data), [detail.documentation.data]);
  const fmu = fmus.find((f) => f.id === router.query.fmuId) || null;
  const observations = useMemo(() => parseObservations(detail.observations.data), [detail.observations.data]);
  const documentation = useMemo(() => parseOperatorDocuments(detail.documentation.data, fmu), [detail.documentation.data, fmu]);

  return {
    operatorsDetail: { ...detail, loading },
    observations,
    documentation,
    fmus,
    fmu,
    date,
    reload,
    loadFmus
  };
}

const OperatorsDetailLayout = ({ children, operatorsDetail: initial }) => {
  const router = useRouter();
  const intl = useIntl();
  const user = useUser();
  const value = useOperatorDetailState(initial);
  const { operatorsDetail } = value;

  const getTabOptions = useMemo(() => {
    const operatorsData = operatorsDetail.data;
    const observationsCount = operatorsData.observations ? operatorsData.observations.filter(o => !o.hidden).length : 0;

    return TABS_OPERATORS_DETAIL.map((tab) => {
      let number;
      switch (tab.value) {
        case 'documentation': {
          number = `${HELPERS_DOC.getPercentage(operatorsData)}%`;
          break;
        }
        case 'observations': {
          number = observationsCount;
          break;
        }

        default: {
          const tabData = operatorsData[tab.value];
          number = tabData ? tabData.length : null;
        }
      }

      return {
        ...tab,
        path: `/operators/${operatorsData.slug}/${tab.value}`,
        label: intl.formatMessage({ id: tab.label }),
        number,
      };
    });
  }, [operatorsDetail.data, intl]);

  const id = operatorsDetail.data.id;
  const slug = router.query.id;
  const tab = router.pathname.split("/").pop() || 'overview';
  const logoPath = operatorsDetail.data.logo?.thumbnail
    ? operatorsDetail.data.logo.thumbnail.url
    : '';
  const logo = logoPath !== '/api/placeholder.png' ? logoPath : '';

  let subtitle = intl.formatMessage(
    { id: 'operator-detail.subtitle' },
    {
      rank: operatorsDetail.data['country-doc-rank'],
      rankCount: operatorsDetail.data['country-operators'],
      country: operatorsDetail.data.country?.name
    }
  );

  if (intl.locale === 'fr') {
    const newPreposition = COUNTRIES_FRENCH_FIX[operatorsDetail.data.country?.iso];
    if (newPreposition) {
      subtitle = subtitle.replace(/\sen\s/, ` ${newPreposition} `);
    }
  }

  return (
    <OperatorDetailContext.Provider value={value}>
    <Layout
      title={operatorsDetail.data.name || '-'}
      description="Forest operator's name description..."
    >
      <Spinner isLoading={operatorsDetail.loading} className="-fixed" />

      <StaticHeader
        title={operatorsDetail.data.name || '-'}
        subtitle={subtitle}
        background="/static/images/static-header/bg-operator-detail.jpg"
        Component={
          user.canManageOperator(id) && (
            <Link href={`/operators/edit/${id}`} className="c-button -secondary -small">
              {intl.formatMessage({ id: 'update.profile' })}
            </Link>
          )
        }
        tabs
        logo={logo}
      />

      <Tabs
        href={{
          pathname: router.pathname,
          query: { id: slug },
          as: `/operators/${slug}`,
        }}
        options={getTabOptions}
        selected={tab}
      />

      {children}
    </Layout>
    </OperatorDetailContext.Provider>
  );
};

OperatorsDetailLayout.propTypes = {
  children: PropTypes.any.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
};

export default OperatorsDetailLayout;
