import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

class AboutPage extends Page {

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="About"
        description="About description..."
        url={url}
        session={session}
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

export default withRedux(
  store
)(AboutPage);
