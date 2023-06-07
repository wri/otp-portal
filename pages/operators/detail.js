import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Intl
import { injectIntl } from 'react-intl';

// Constants
import { TABS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';
import { getParsedTimeline } from 'selectors/operators-detail/timeline';

// Redux
import { connect } from 'react-redux';
import {
  getOperator,
  getOperatorBySlug,
  getOperatorDocumentation,
  getOperatorDocumentationCurrent,
  getOperatorTimeline,
  getOperatorObservations
} from 'modules/operators-detail';
import { getIntegratedAlertsMetadata } from 'modules/operators-detail-fmus';

import Link from 'next/link';
import Router from 'next/router';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

// Operator Details Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';
import OperatorsDetailObservations from 'components/operators-detail/observations';
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

const COUNTRIES_FRENCH_FIX = {
  'CMR': 'au', // Cameroon
  'COG': 'au', // Congo
  'GAB': 'au', // Gabon
};

const isClient = typeof window !== 'undefined';

class OperatorsDetail extends React.Component {
  static async getInitialProps({ url, res, store }) {
    const { operatorsDetail, operatorsDetailFmus } = store.getState();
    const requests = [];

    if (!operatorsDetailFmus.layersSettings['integrated-alerts']) {
      requests.push(store.dispatch(getIntegratedAlertsMetadata()));
    }

    // we are going to redirect to slug if the id is a number
    if (!isNaN(url.query.id)) {
      await store.dispatch(getOperator(url.query.id));
      const operator = store.getState().operatorsDetail.data;

      if (!operator || isEmpty(operator)) {
        return { errorCode: 404 };
      }
      return { redirectTo: url.asPath.replace(`/${url.query.id}`, `/${operator.slug}`) }
    }

    if (operatorsDetail.data.slug !== url.query.id) {
      await store.dispatch(getOperatorBySlug(url.query.id));
      const operator = store.getState().operatorsDetail.data;

      if (operator && !isEmpty(operator)) {
        requests.push(store.dispatch(getOperatorObservations(operator.id)));

        if (isClient || url.query.tab === 'documentation') {
          requests.push(store.dispatch(getOperatorDocumentation(operator.id)));
          requests.push(store.dispatch(getOperatorDocumentationCurrent(operator.id)));
          requests.push(store.dispatch(getOperatorTimeline(operator.id)));
        }
      } else {
        return { errorCode: 404 };
      }
    }

    await Promise.all(requests);

    return { url };
  }

  /**
   * COMPONENT LIFECYCLE
   */
  componentDidMount() {
    const { url, operatorsDetail } = this.props;
    const operator = operatorsDetail.data;

    // eager load documentation tab as high probabilty user will switch to it
    if (url.query.tab !== 'documentation') {
      this.props.getOperatorDocumentation(operator.id);
      this.props.getOperatorDocumentationCurrent(operator.id);
      this.props.getOperatorTimeline(operator.id);
    }
  }

  componentDidUpdate(prevProps) {
    const prevDate = prevProps?.operatorsDetail?.date?.toString();
    const newDate = this.props?.operatorsDetail?.date?.toString();

    if (prevDate !== newDate) {
      const { url, operatorsDetail } = this.props;
      const operator = operatorsDetail.data;
      this.props.getOperatorDocumentation(operator.id);
      this.props.getOperatorDocumentationCurrent(operator.id);
    }
  }

  /**
   * HELPERS
   * - getTabOptions
   */
  getTabOptions() {
    const operatorsDetail = this.props.operatorsDetail.data;

    return TABS_OPERATORS_DETAIL.map((tab) => {
      let number;
      switch (tab.value) {
        case 'documentation': {
          number = `${HELPERS_DOC.getPercentage(operatorsDetail)}%`;
          break;
        }
        case 'observations': {
          number = this.props.operatorObservations.filter(o => !o.hidden).length;
          break;
        }

        default: {
          const tabData = operatorsDetail[tab.value];
          number = tabData ? tabData.length : null;
        }
      }

      return {
        ...tab,
        label: this.props.intl.formatMessage({ id: tab.label }),
        number,
      };
    });
  }

  render() {
    const {
      url,
      user,
      operatorsDetail,
      operatorObservations,
      operatorDocumentation,
      operatorTimeline,
      intl
    } = this.props;

    const id = operatorsDetail.data.id;
    const slug = url.query.id;
    const tab = url.query.tab || 'overview';
    const logoPath = operatorsDetail.data.logo
      ? operatorsDetail.data.logo.url
      : '';
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
        url={url}
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
              <Link href="/operators/edit">
                <a className="c-button -secondary -small">
                  {intl.formatMessage({ id: 'update.profile' })}
                </a>
              </Link>
            )
          }
          tabs
          logo={logoPath !== '/api/placeholder.png' ? logoPath : ''}
        />

        <Tabs
          href={{
            pathname: url.pathname,
            query: { id: slug },
            as: `/operators/${slug}`,
          }}
          options={this.getTabOptions()}
          selected={tab}
        />

        {tab === 'overview' && (
          <OperatorsDetailOverview
            operatorsDetail={operatorsDetail}
            operatorDocumentation={operatorDocumentation}
            operatorObservations={operatorObservations.filter(o => !o.hidden)}
            url={url}
          />
        )}

        {tab === 'documentation' && (
          <OperatorsDetailDocumentation
            operatorsDetail={operatorsDetail}
            operatorDocumentation={operatorDocumentation}
            operatorTimeline={operatorTimeline}
            url={url}
          />
        )}

        {tab === 'observations' && (
          <OperatorsDetailObservations
            operatorsDetail={operatorsDetail}
            operatorObservations={operatorObservations}
            url={url}
          />
        )}

        {tab === 'fmus' && (
          <OperatorsDetailFMUs operatorsDetail={operatorsDetail} url={url} />
        )}
      </Layout>
    );
  }
}

OperatorsDetail.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array,
  operatorTimeline: PropTypes.array,
  user: PropTypes.shape({}),
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  connect(
    (state) => ({
      user: state.user,
      operatorsDetail: state.operatorsDetail,
      operatorObservations: getParsedObservations(state),
      operatorDocumentation: getParsedDocumentation(state),
      operatorTimeline: getParsedTimeline(state),
    }),
    {
      getOperator,
      getOperatorDocumentation,
      getOperatorDocumentationCurrent,
      getOperatorTimeline,
      getOperatorObservations
    }
  )(OperatorsDetail)
);
