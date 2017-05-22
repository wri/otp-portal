import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Page from 'components/layout/page';

export default class ErrorEmailPage extends React.Component {

  render() {
    return (
      <Page
        title="Error email"
        description="Error email description..."
        session={this.props.session}
      >
        <h2>Unable to sign in</h2>
        <p>The link you tried to use to sign in was not valid.</p>
        <p><Link href="/auth/signin"><a>Request a new sign in link.</a></Link></p>
      </Page>
    );
  }

}

ErrorEmailPage.propTypes = {
  session: PropTypes.object.isRequired
};
