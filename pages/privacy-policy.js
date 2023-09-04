import React from 'react';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import Jsona from 'jsona';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Html from 'components/html';
import CookiesTable from 'components/page/cookies-table';

import API from 'services/api';

const JSONA = new Jsona();

const PrivacyPolicyPage = ({ url, intl, page, cookies }) => {
  const placeholders = {
    CookiesTable: renderToString(<CookiesTable cookies={cookies} />)
  }

  return (
    <Layout
      title={intl.formatMessage({ id: 'Privacy Policy' })}
      description={intl.formatMessage({ id: 'Privacy Policy' })}
      url={url}
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

PrivacyPolicyPage.getInitialProps = async ({ url }) => {
  const page = await API
    .get('pages', { 'filter[slug]': 'privacy-policy', locale: 'en' })
    .then((response) => JSONA.deserialize(response)[0]);

  let cookies = [];
  if (process.env.OSANO_ID) {
    cookies = await fetch(
      `https://disclosure.api.osano.com/customer/${process.env.OSANO_ID.replace('/', '/config/')}?language=en`
    ).then((response) => response.json());
  }

  return { url, page, cookies };
}

PrivacyPolicyPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired,
  page: PropTypes.object.isRequired,
  cookies: PropTypes.array.isRequired
};

export default injectIntl(PrivacyPolicyPage);
