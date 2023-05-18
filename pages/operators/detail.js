import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

// Utils
import { HELPERS_DOC } from 'utils/documentation';
import { logEvent } from 'utils/analytics';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

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
  getOperatorDocumentation,
  getOperatorDocumentationCurrent,
  getOperatorTimeline,
  getOperatorObservations,
  setOperatorDocumentationDate,
} from 'modules/operators-detail';
import { getIntegratedAlertsMetadata } from 'modules/operators-detail-fmus';
import withTracker from 'components/layout/with-tracker';

import Link from 'next/link';

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
  static async getInitialProps({ url, store }) {
    const { operatorsDetail, operatorsDetailFmus } = store.getState();
    const requests = [];

    if (!operatorsDetailFmus.layersSettings['integrated-alerts']) {
      requests.push(store.dispatch(getIntegratedAlertsMetadata()));
    }

    if (operatorsDetail.data.id !== url.query.id) {
      requests.push(store.dispatch(getOperator(url.query.id)));
      requests.push(store.dispatch(getOperatorObservations(url.query.id)));

      if (isClient || url.query.tab === 'documentation') {
        requests.push(store.dispatch(getOperatorDocumentation(url.query.id)));
        requests.push(store.dispatch(getOperatorDocumentationCurrent(url.query.id)));
        requests.push(store.dispatch(getOperatorTimeline(url.query.id)));
      }
    }

    await Promise.all(requests);

    return { url };
  }

  /**
   * COMPONENT LIFECYCLE
   */
  componentDidMount() {
    const { url } = this.props;

    // eager load documentation tab as high probabilty user will switch to it
    if (url.query.tab !== 'documentation') {
      this.props.getOperatorDocumentation(url.query.id);
      this.props.getOperatorDocumentationCurrent(url.query.id);
      this.props.getOperatorTimeline(url.query.id);
    }
  }

  componentDidUpdate(prevProps) {
    const prevDate = prevProps?.operatorsDetail?.date?.toString();
    const newDate = this.props?.operatorsDetail?.date?.toString();

    const { url } = prevProps;
    const { url: nextUrl } = this.props;
    if (url.query.tab !== nextUrl.query.tab) {
      const { tab } = nextUrl.query || 'overview';
      logEvent('Producers', 'Change tab', tab);
    }

    if (prevDate !== newDate) {
      const { url } = this.props;
      this.props.getOperatorDocumentation(url?.query?.id);
      this.props.getOperatorDocumentationCurrent(url?.query?.id);
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
    const id = url.query.id;
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
            query: { id },
            as: `/operators/${id}`,
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
  intl: intlShape.isRequired,
};

export default withTracker(
  withIntl(
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
  )
);
