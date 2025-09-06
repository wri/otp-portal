import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';
import { useRouter } from 'next/router';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Intl
import { useIntl } from 'react-intl';

// Redux
import { useSelector } from 'react-redux';
import {
  getOperator,
  getOperatorBySlug,
  getOperatorDocumentation,
  getOperatorPublicationAuthorization,
  getOperatorTimeline,
  getOperatorObservations
} from 'modules/operators-detail';

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

// shared getInitialProps for operator's detail pages
export async function getInitialProps({ query, asPath, res, store, ...rest }) {
  let { operatorsDetail, user } = store.getState();
  const requests = [];
  const { id } = query;
  const tab = asPath.split('/').pop().split('?')[0];

  // we are going to redirect to slug if the id is a number
  if (!isNaN(id)) {
    await store.dispatch(getOperator(id));
    const operator = store.getState().operatorsDetail.data;

    if (!operator || isEmpty(operator)) {
      return { statusCode: 404 };
    }
    return { redirectTo: asPath.replace(`/${id}`, `/${operator.slug}`) }
  }

  const operatorChanged = operatorsDetail.data.slug !== id;
  if (operatorChanged) {
    await store.dispatch(getOperatorBySlug({ slug: id }));
  }
  operatorsDetail = store.getState().operatorsDetail;
  const operator = operatorsDetail.data;

  if (operator && !isEmpty(operator)) {
    if (operatorsDetail.documentation.operatorId !== operator.id && tab === 'documentation') {
      requests.push(store.dispatch(getOperatorDocumentation(operator.id)));
      requests.push(store.dispatch(getOperatorTimeline(operator.id)));
      if (user.token && (user.role === 'admin' || user.operator_ids && user.operator_ids.includes(+operator.id))) {
        requests.push(store.dispatch(getOperatorPublicationAuthorization(operator.id)));
      }
    }

    if (operatorsDetail.observations.operatorId !== operator.id && (tab === 'observations' || tab === 'overview')) {
      requests.push(store.dispatch(getOperatorObservations(operator.id)));
    }
  } else {
    return { statusCode: 404 };
  }

  await Promise.all(requests);

  return {};
}

const OperatorsDetailLayout = ({ children }) => {
  const router = useRouter();
  const intl = useIntl();
  const user = useUser();
  const operatorsDetail = useSelector(state => state.operatorsDetail);

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
  );
};

OperatorsDetailLayout.propTypes = {
  children: PropTypes.any.isRequired,
};

export default OperatorsDetailLayout;
