import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { getOperators } from 'modules/operators';
import { getHowtos, getTools, getFAQs, getTutorials } from 'modules/help';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';

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

class HelpPage extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const url = { asPath, pathname, query };
    const { operators } = store.getState();
    let user = null;

    if (isServer) {
      user = req.session ? req.session.user : {};
    } else {
      user = store.getState().user;
    }

    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!operators.data.length) {
      await store.dispatch(getOperators());
    }

    await store.dispatch(getHowtos());
    await store.dispatch(getTools());
    await store.dispatch(getFAQs());
    await store.dispatch(getTutorials());

    return { isServer, url };
  }

  render() {
    const { url, howtos, tools, faqs, tutorials } = this.props;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'help.title' })}
        description="Help description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'help.title' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <Tabs
          href={{
            pathname: url.pathname,
            query: { },
            as: url.pathname
          }}
          options={[{
            label: this.props.intl.formatMessage({ id: 'overview' }),
            value: 'overview'
          }, {
            label: this.props.intl.formatMessage({ id: 'help.tabs.howto' }),
            value: 'how-otp-works'
          }, {
            label: this.props.intl.formatMessage({ id: 'help.tabs.legislation' }),
            value: 'legislation-and-regulations'
          }, {
            label: this.props.intl.formatMessage({ id: 'help.tabs.faqs' }),
            value: 'faqs'
          }, {
            label: this.props.intl.formatMessage({ id: 'help.tabs.tutorials' }),
            value: 'tutorials'
          }]}
          defaultSelected={tab}
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
          <HelpHowOTPWorks
            url={url}
            howtos={howtos}
          />
        }

        {tab === 'legislation-and-regulations' &&
          <HelpLegislationAndRegulations
            url={url}
            tools={tools}
          />
        }

        {tab === 'faqs' &&
          <HelpFaqs
            url={url}
            faqs={faqs}
          />
        }

        {tab === 'tutorials' &&
          <HelpTutorials
            url={url}
            tutorials={tutorials}
          />
        }

      </Layout>
    );
  }

}

HelpPage.propTypes = {
  url: PropTypes.object.isRequired
};

export default withTracker(withIntl(connect(

  state => ({
    howtos: state.help.howtos,
    tools: state.help.tools,
    faqs: state.help.faqs,
    tutorials: state.help.tutorials
  }),
  { getHowtos, getTools, getFAQs, getTutorials }
)(HelpPage)));
