import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';

export default class CheckEmailPage extends React.Component {

  render() {
    return (
      <Page
        title="Check email"
        description="Check email description..."
        session={this.props.session}
      >
        <h2>Check your email</h2>
        <p>You have been sent an email with a link you can use to sign in.</p>
      </Page>
    );
  }

}

CheckEmailPage.propTypes = {
  session: PropTypes.object.isRequired
};
