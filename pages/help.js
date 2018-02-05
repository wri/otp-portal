import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';
import withTracker from 'components/layout/with-tracker';
import { getFAQs } from 'modules/help';

// Intl
import withIntl from 'hoc/with-intl';

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
      this.props.getOperators();
      this.props.getFAQs();
    }
  }

  render() {
    const { url, faqs } = this.props;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'help.title' })}
        description="Help description..."
        url={url}
        searchList={this.props.operators.data}
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
          }]}
          defaultSelected={tab}
          selected={tab}
        />

        {tab === 'overview' &&
          <HelpOverview
            faqs={faqs}
          />
        }

        {tab === 'how-otp-works' &&
          <HelpHowOTPWorks
            url={url}
          />
        }

        {tab === 'legislation-and-regulations' &&
          <HelpLegislationAndRegulations
            url={url}
          />
        }

        {tab === 'faqs' &&
          <HelpFaqs
            url={url}
            faqs={faqs}
          />
        }

      </Layout>
    );
  }

}

HelpPage.propTypes = {
  url: PropTypes.object.isRequired
};

export default withTracker(withIntl(withRedux(
  store,
  state => ({
    operators: state.operators,
    faqs: state.help.faqs
  }),
  { getOperators, getFAQs }
)(HelpPage)));
