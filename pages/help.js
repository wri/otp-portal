import React from 'react';
import PropTypes from 'prop-types';

// Constants
import { TABS_HELP } from 'constants/help';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';

// Help Tabs
import HelpOverview from 'components/help/overview';
import HelpHowOTPWorks from 'components/help/how-otp-works';
import HelpLegislationAndRegulations from 'components/help/legislation-and-regulations';
import HelpFaqs from 'components/help/faqs';

class HelpPage extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  render() {
    const { url } = this.props;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title="Help"
        description="Help description..."
        url={url}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title="Help"
          background="/static/images/static-header/bg-help.jpg"
        />
        <Tabs
          href={{
            pathname: url.pathname,
            query: { },
            as: url.pathname
          }}
          options={TABS_HELP}
          defaultSelected={tab}
          selected={tab}
        />

        {tab === 'overview' &&
          <HelpOverview />
        }

        {tab === 'how-otp-works' &&
          <HelpHowOTPWorks />
        }

        {tab === 'legislation-and-regulations' &&
          <HelpLegislationAndRegulations />
        }

        {tab === 'faqs' &&
          <HelpFaqs />
        }

      </Layout>
    );
  }

}

HelpPage.propTypes = {
  url: PropTypes.object.isRequired
};

export default withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(HelpPage);
