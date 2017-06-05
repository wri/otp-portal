import React from 'react';
import PropTypes from 'prop-types';

// Constants
import { TABS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';

// Help Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';
import OperatorsDetailObservations from 'components/operators-detail/observations';
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

class OperatorsDetail extends Page {
  render() {
    const { url, session } = this.props;
    const id = url.query.id;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title="Forest operator's name"
        description="Forest operator's name description..."
        url={url}
        session={session}
      >
        <StaticHeader
          title="Forest operator's name"
          background="/static/images/static-header/bg-operator-detail.jpg"
        />
        <Tabs
          href={{
            pathname: url.pathname,
            query: { id },
            as: `/operators/${id}`
          }}
          options={TABS_OPERATORS_DETAIL}
          defaultSelected={tab}
          selected={tab}
        />

        {tab === 'overview' &&
          <OperatorsDetailOverview />
        }

        {tab === 'documentation' &&
          <OperatorsDetailDocumentation />
        }

        {tab === 'observations' &&
          <OperatorsDetailObservations />
        }

        {tab === 'fmus' &&
          <OperatorsDetailFMUs />
        }

      </Layout>
    );
  }

}

OperatorsDetail.propTypes = {
  url: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

export default withRedux(
  store
)(OperatorsDetail);
