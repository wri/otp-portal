import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Html from 'components/html';
import CookiesTable from 'components/page/cookies-table';

import API from 'services/api';

const PrivacyPolicyPage = ({ page, cookies }) => {
  const intl = useIntl();
  const placeholders = {
    CookiesTable: <CookiesTable cookies={cookies} />
  }

  return (
    <Layout
      title={intl.formatMessage({ id: 'Privacy Policy' })}
      description={intl.formatMessage({ id: 'Privacy Policy' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'Privacy Policy' })}
        background="/static/images/static-header/bg-about.jpg"
      />

      <div className="c-section">
        <div className="l-container">
          <article className="c-article">
            <div className="content">
              <div className="description">
                <Html html={page.body} placeholders={placeholders} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  )
}

PrivacyPolicyPage.getInitialProps = async () => {
  const page = await API
    .get('pages', { 'filter[slug]': 'privacy-policy', locale: 'en' })
    .then(({ data }) => data[0]);

  let cookies = [];
  if (process.env.OSANO_ID) {
    cookies = await fetch(
      `https://disclosure.api.osano.com/customer/${process.env.OSANO_ID.replace('/', '/config/')}?language=en`
    ).then((response) => response.json());
  }

  return { page, cookies };
}

PrivacyPolicyPage.propTypes = {
  page: PropTypes.object.isRequired,
  cookies: PropTypes.array.isRequired
};

export default PrivacyPolicyPage;
