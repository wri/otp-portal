import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Html from 'components/html';

import API from 'services/api';

const TermsPage = ({ page }) => {
  const intl = useIntl();
  return (
    <Layout
      title={intl.formatMessage({ id: 'terms.title' })}
      description={intl.formatMessage({ id: 'terms.title' })}
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

TermsPage.getInitialProps = async () => {
  const page = await API
    .get('pages', { 'filter[slug]': 'terms', locale: 'en' })
    .then(({ data }) => data[0]);

  return { page };
}

TermsPage.propTypes = {
  page: PropTypes.object.isRequired
};

export default TermsPage;
