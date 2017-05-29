import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';

class NotConfiguredPage extends Page {

  render() {
    return (
      <Layout
        title="Not configured"
        description="Not configured description..."
        session={this.props.session}
      >
        <h2>Not configured</h2>
        <p>This oAuth provider has not been configured.</p>
        <p><Link href="/auth/signin"><a>Sign in via email</a></Link></p>
      </Layout>
    );
  }

}

NotConfiguredPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store
)(NotConfiguredPage);
