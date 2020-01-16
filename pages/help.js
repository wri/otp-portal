import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getOperators } from 'modules/operators';
import withTracker from 'components/layout/with-tracker';
import { getHowtos, getTools, getFAQs, getTutorials } from 'modules/help';

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
import HelpTutorials from 'components/help/tutorials';

class HelpPage extends Page {

  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators, howtos, tools, faqs, tutorials } = this.props;

    if (!operators.data.length) {
      this.props.getOperators();
    }

    if (!howtos.data.length) {
      this.props.getHowtos();
    }

    if (!tools.data.length) {
      this.props.getTools();
    }

    if (!faqs.data.length) {
      this.props.getFAQs();
    }

    if (!tutorials.data.length) {
      this.props.getTutorials();
    }
  }

  render() {
    const { url, howtos, tools, faqs, tutorials } = this.props;
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
    operators: state.operators,
    howtos: state.help.howtos,
    tools: state.help.tools,
    faqs: state.help.faqs,
    tutorials: state.help.tutorials
  }),
  { getOperators, getHowtos, getTools, getFAQs, getTutorials }
)(HelpPage)));
