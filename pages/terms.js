import React from 'react';
import PropTypes from 'prop-types';
import Jsona from 'jsona';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Html from 'components/html';

import API from 'services/api';

const JSONA = new Jsona();

const TermsPage = ({ url, intl, page }) => {
  return (
    <Layout
      title={intl.formatMessage({ id: 'terms.title' })}
      description={intl.formatMessage({ id: 'terms.title' })}
      url={url}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'terms.title' })}
        background="/static/images/static-header/bg-about.jpg"
      />

      <div className="c-section">
        <div className="l-container">
          <article className="c-article">
            <div className="content">
              <div className="description">
                <Html html={page.body} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  )
}

TermsPage.getInitialProps = async ({ url }) => {
  const page = await API
    .get('pages', { 'filter[slug]': 'terms', locale: 'en' })
    .then((response) => JSONA.deserialize(response)[0]);

  return { url, page };
}

TermsPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired,
  page: PropTypes.object.isRequired
};

export default injectIntl(TermsPage);
