import React from 'react';
import PropTypes from 'prop-types';

// Constants
import { TABS_HELP } from 'constants/help';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';
import Tabs from 'components/ui/tabs';

// Help Tabs
import HelpOverview from 'components/help/overview';
import HelpHowOTPWorks from 'components/help/how-otp-works';
import HelpLegislationAndRegulations from 'components/help/legislation-and-regulations';
import HelpFaqs from 'components/help/faqs';

export default class HelpPage extends Page {
  render() {
    const { url, session } = this.props;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title="Help"
        description="Help description..."
        url={url}
        session={session}
      >
        <StaticHeader
          title="Help"
          background="/static/images/static-header/bg-help.jpg"
        />
        <Tabs
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
  url: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
