import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Redux
import { connect } from 'react-redux';

import { getCountries } from 'modules/countries';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewForm from 'components/users/new';

const SignUp = (props) => {
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const { url } = props;
  const intl = useIntl();
  const creatingNewAccountText = intl.formatMessage({ id: "signup.user.header", defaultMessage: "Creating a new account" });
  const title = submittedEmail
    ? intl.formatMessage({ id: "signup.user.thank_you_header", defaultMessage: "Thank you for signing up!" })
    : creatingNewAccountText

  return (
    <Layout
      title={creatingNewAccountText}
      description={creatingNewAccountText}
      url={url}
    >
      <StaticHeader
        title={title}
        background="/static/images/static-header/bg-help.jpg"
      />

      {!submittedEmail && <UserNewForm onSubmit={({ email }) => setSubmittedEmail(email)} />}
      {submittedEmail && (
        <div className="c-section">
          <div className="l-container">
            <div className="c-info-box -center">
              <p>
                {intl.formatMessage({ id: "signup.user.thank_you.paragraph1", defaultMessage: "We received your request and we will review it as soon as possible. This process might take a few days, and you will receive an email to {submittedEmail} once your account is approved. Be sure to check your spam folder." }, { submittedEmail })}
              </p>

              <p>
                {intl.formatMessage({ id: "signup.user.thank_you.paragraph2", defaultMessage: "In the meantime, you can explore the platform and learn more about the data we have available." })}
              </p>

              <Link href="/">
                <a className="card-link c-button -primary">
                  {intl.formatMessage({ id: 'Back to home page' })}
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

SignUp.getInitialProps = async ({ url, store }) => {
  await store.dispatch(getCountries());

  return { url };
}

SignUp.propTypes = {
  url: PropTypes.shape({}).isRequired
};

export default connect(
  (state) => ({
    countries: state.countries,
  }),
  { getCountries }
)(SignUp);
