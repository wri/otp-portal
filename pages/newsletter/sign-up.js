import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewsLetterForm from 'components/users/newsletter';

const NewsletterSignUp = ({ url }) => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'newsletter' })}
      description={intl.formatMessage({ id: 'newsletter' })}
      url={url}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'newsletter' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <UserNewsLetterForm />
    </Layout>
  );

}

NewsletterSignUp.propTypes = {
  url: PropTypes.shape({}).isRequired,
};
NewsletterSignUp.getInitialProps = ({ url }) => {
  return { redirectTo: '/newsletter', redirectPermanent: false };
  // return { url };
};

export default NewsletterSignUp;
