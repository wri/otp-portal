import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Page from 'components/layout/page';

export default class NotConfiguredPage extends React.Component {

  render() {
    return (
      <Page
        title="Not configured"
        description="Not configured description..."
        session={this.props.session}
      >
        <h2>Not configured</h2>
        <p>This oAuth provider has not been configured.</p>
        <p><Link href="/auth/signin"><a>Sign in via email</a></Link></p>
      </Page>
    );
  }

}

NotConfiguredPage.propTypes = {
  session: PropTypes.object.isRequired
};
