import React from 'react';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewsLetterForm from 'components/users/newsletter';

const NewsletterSignUp = () => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'newsletter' })}
      description={intl.formatMessage({ id: 'newsletter' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'newsletter' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <UserNewsLetterForm />
    </Layout>
  );

}

export default NewsletterSignUp;
