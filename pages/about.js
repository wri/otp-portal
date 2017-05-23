import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

export default class AboutPage extends Page {

  render() {
    return (
      <Layout
        title="About"
        description="About description..."
        session={this.props.session}
      >
        <StaticHeader
          title="About"
          background="/static/images/static-header/bg-help.jpg"
        />
      </Layout>
    );
  }

}

AboutPage.propTypes = {
  session: PropTypes.object.isRequired
};
