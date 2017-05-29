import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';

class CheckEmailPage extends Page {

  render() {
    return (
      <Layout
        title="Check email"
        description="Check email description..."
        session={this.props.session}
      >
        <h2>Check your email</h2>
        <p>You have been sent an email with a link you can use to sign in.</p>
      </Layout>
    );
  }

}

CheckEmailPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store
)(CheckEmailPage);
