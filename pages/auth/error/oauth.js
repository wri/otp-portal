import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Page from 'components/layout/page';

export default class ErrorOauthPage extends React.Component {

  render() {
    return (
      <Page
        title="Error oAuth"
        description="Error oAuth description..."
        session={this.props.session}
      >
        <h2>Unable to sign in</h2>
        <p>If you have already signed in with your email address or previously signed in using a different service, use that method to sign in.</p>
        <p><Link href="/auth/signin"><a>Try signing in with your email address or another service.</a></Link></p>
        <h3>Why can&#39;t I sign in?</h3>
        <p>You can&#39;t sign in with an account if you have previously signed in using your email address or another service that also tied to your email address.
          This is a security measure to prevent someone from hijacking your account by signing up for another service using your email address.
        </p>
        <p>
          Once you have signed in and been authenticated, you can link your accounts so you can use any of them to sign in next time.
        </p>
      </Page>
    );
  }

}

ErrorOauthPage.propTypes = {
  session: PropTypes.object.isRequired
};
