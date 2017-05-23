import React from 'react';
import PropTypes from 'prop-types';

// Constants
import { TABS_HELP } from 'constants/help';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';
import Tabs from 'components/ui/tabs';

export default class HelpPage extends Page {
  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Help"
        description="Help description..."
        session={this.props.session}
      >
        <StaticHeader
          title="Help"
          background="/static/images/static-header/about.jpg"
        />
        <Tabs
          options={TABS_HELP}
          defaultSelected={url.query.tab || 'overview'}
          selected={url.query.tab || 'overview'}
        />
      </Layout>
    );
  }

}

HelpPage.propTypes = {
  url: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
