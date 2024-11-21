import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';
import { withRouter } from 'next/router';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Intl
import { injectIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import {
  getOperator,
  getOperatorBySlug,
  getOperatorDocumentation,
  getOperatorPublicationAuthorization,
  getOperatorTimeline,
  getOperatorObservations
} from 'modules/operators-detail';
import { getIntegratedAlertsMetadata } from 'modules/operators-detail-fmus';

import Link from 'next/link';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

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
  'COG': 'au', // Congo
  'GAB': 'au', // Gabon
};

// shared getInitialProps for operator's detail pages
export async function getInitialProps({ query, asPath, res, store, ...rest }) {
  let { operatorsDetail, user } = store.getState();
  const requests = [];
  const {id} = query;
  const tab = asPath.split('/').pop();

  // we are going to redirect to slug if the id is a number
  if (!isNaN(id)) {
    await store.dispatch(getOperator(id));
    const operator = store.getState().operatorsDetail.data;

    if (!operator || isEmpty(operator)) {
      return { errorCode: 404 };
    }
    return { redirectTo: asPath.replace(`/${id}`, `/${operator.slug}`) }
  }

  const operatorChanged = operatorsDetail.data.slug !== id;
  if (operatorChanged) {
    await store.dispatch(getOperatorBySlug(id));
  }
  operatorsDetail = store.getState().operatorsDetail;
  const operator = operatorsDetail.data;
  if (operator && !isEmpty(operator)) {
    if (operatorsDetail.documentation.operatorId !== operator.id && tab === 'documentation') {
      requests.push(store.dispatch(getOperatorDocumentation(operator.id)));
      requests.push(store.dispatch(getOperatorTimeline(operator.id)));
      if (user.token && user.operator_ids && user.operator_ids.includes(+operator.id)) {
        requests.push(store.dispatch(getOperatorPublicationAuthorization(operator.id)));
      }
    }

    if (operatorsDetail.observations.operatorId !== operator.id && (tab === 'observations' || tab === 'overview')) {
      requests.push(store.dispatch(getOperatorObservations(operator.id)));
    }
  } else {
    return { errorCode: 404 };
  }

  await Promise.all(requests);

  return {};
}

class OperatorsDetailLayout extends React.Component {
  /**
   * HELPERS
   * - getTabOptions
   */
  getTabOptions() {
    const operatorsDetail = this.props.operatorsDetail.data;
    const observationsCount = operatorsDetail.observations ? operatorsDetail.observations.filter(o => !o.hidden).length : 0;

    return TABS_OPERATORS_DETAIL.map((tab) => {
      let number;
      switch (tab.value) {
        case 'documentation': {
          number = `${HELPERS_DOC.getPercentage(operatorsDetail)}%`;
          break;
        }
        case 'observations': {
          number = observationsCount;
          break;
        }

        default: {
          const tabData = operatorsDetail[tab.value];
          number = tabData ? tabData.length : null;
        }
      }

      return {
        ...tab,
        path: `/operators/${operatorsDetail.slug}/${tab.value}`,
        label: this.props.intl.formatMessage({ id: tab.label }),
        number,
      };
    });
  }

  render() {
    const {
      router,
      user,
      operatorsDetail,
      children,
      intl
    } = this.props;

    const id = operatorsDetail.data.id;
    const slug = router.query.id;
    const tab = router.asPath.split("/").pop() || 'overview';
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
            user &&
            (user.role === 'operator' || user.role === 'holding') &&
            user.operator_ids &&
            user.operator_ids.includes(+id) && (
              (<Link href={`/operators/edit/${id}`} className="c-button -secondary -small">
                {intl.formatMessage({ id: 'update.profile' })}
              </Link>)
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
          options={this.getTabOptions()}
          selected={tab}
        />

        {children}
      </Layout>
    );
  }
}

OperatorsDetailLayout.propTypes = {
  children: PropTypes.any.isRequired,
  router: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object,
  user: PropTypes.shape({}),
  intl: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(
  connect(
    (state) => ({
      user: state.user,
      operatorsDetail: state.operatorsDetail
    }),
    {
      getOperator,
      getOperatorDocumentation,
      getOperatorPublicationAuthorization,
      getOperatorTimeline,
      getOperatorObservations,
      getIntegratedAlertsMetadata
    }
  )(OperatorsDetailLayout)
));
