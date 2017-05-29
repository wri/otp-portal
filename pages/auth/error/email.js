import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

class ErrorEmailPage extends Page {

  render() {
    return (
      <Layout
        title="Error email"
        description="Error email description..."
        session={this.props.session}
      >
        <h2>Unable to sign in</h2>
        <p>The link you tried to use to sign in was not valid.</p>
        <p><Link href="/auth/signin"><a>Request a new sign in link.</a></Link></p>
      </Layout>
    );
  }

}

ErrorEmailPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store
)(ErrorEmailPage);
