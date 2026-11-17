import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';

import { fetchApi, settle, CONTENT_MAX_AGE } from 'services/fetch-api';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';

// Help Tabs
import HelpOverview from 'components/help/overview';
import HelpHowOTPWorks from 'components/help/how-otp-works';
import HelpLegislationAndRegulations from 'components/help/legislation-and-regulations';
import HelpFaqs from 'components/help/faqs';
import HelpTutorials from 'components/help/tutorials';

const HelpPage = ({ router, howtos, tools, faqs, tutorials }) => {
  const intl = useIntl();
  const tab = router.query.tab || 'overview';

  return (
    <Layout
      title={intl.formatMessage({ id: 'help.title' })}
      description="Help description..."
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'help.title' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <Tabs
        href={{
          pathname: router.pathname,
          query: { },
          as: '/help'
        }}
        options={[{
          label: intl.formatMessage({ id: 'overview' }),
          value: 'overview'
        }, {
          label: intl.formatMessage({ id: 'help.tabs.howto' }),
          value: 'how-otp-works'
        }, {
          label: intl.formatMessage({ id: 'help.tabs.legislation' }),
          value: 'legislation-and-regulations'
        }, {
          label: intl.formatMessage({ id: 'help.tabs.faqs' }),
          value: 'faqs'
        }, {
          label: intl.formatMessage({ id: 'help.tabs.tutorials' }),
          value: 'tutorials'
        }]}
        selected={tab}
      />

      {tab === 'overview' &&
        <HelpOverview
          howtos={howtos}
          tools={tools}
          faqs={faqs}
          tutorials={tutorials}
        />
      }

      {tab === 'how-otp-works' &&
        <HelpHowOTPWorks howtos={howtos} />
      }

      {tab === 'legislation-and-regulations' &&
        <HelpLegislationAndRegulations tools={tools} />
      }

      {tab === 'faqs' &&
        <HelpFaqs faqs={faqs} />
      }

      {tab === 'tutorials' &&
        <HelpTutorials tutorials={tutorials} />
      }

    </Layout>
  );
};

HelpPage.getInitialProps = async ({ query, asPath, language }) => {
  if (!query.tab) return { redirectTo: `${asPath}/overview` };

  const load = (endpoint) => settle(fetchApi(endpoint, { locale: language, cache: CONTENT_MAX_AGE }), []);
  const [howtos, tools, faqs, tutorials] = await Promise.all(
    ['how-tos', 'tools', 'faqs', 'tutorials'].map(load)
  );

  return { howtos, tools, faqs, tutorials };
};

HelpPage.propTypes = {
  router: PropTypes.object.isRequired,
  howtos: PropTypes.shape({}),
  tools: PropTypes.shape({}),
  faqs: PropTypes.shape({}),
  tutorials: PropTypes.shape({})
};

export default withRouter(HelpPage);
