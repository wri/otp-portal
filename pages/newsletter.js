import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Jsona from 'jsona';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

import API from 'services/api';

const JSONA = new Jsona();

const Newsletter = ({ url, newsletters, language }) => {
  const intl = useIntl();
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language, { year: 'numeric', month: 'long', timeZone: 'UTC' }).replace(/^./, str => str.toUpperCase());
  }

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

      <div className="c-section">
        <div className="l-container">
          <div className="newsletter-header">
            <h2>
              {intl.formatMessage({ id: 'newsletter.showing_results', defaultMessage: 'Showing {count} previous newsletters' }, { count: newsletters.length })}
            </h2>

            {/* <Link href="/newsletter/sign-up">
              <a className="card-link c-button -secondary">
                {intl.formatMessage({ id: 'newsletter.subscribe_to', defaultMessage: 'Subscribe to our newsletter' })}
              </a>
            </Link> */}
          </div>

          <div className="newsletter-grid">
            {newsletters.map(newsletter => (
              // genereate newsletter card with image on top and title and description below
              <div key={newsletter.id} className="newsletter-card">
                <a href={newsletter.attachment.url}>
                  <div className="newsletter-card__image" style={{ backgroundImage: `url(${newsletter.image.url})` }} />
                </a>
                <div className="newsletter-card__content">
                  <h3>
                    <a href={newsletter.attachment.url}>
                      {newsletter.title}
                    </a>
                  </h3>
                  <small className="newsletter-card__date">
                    {formatDate(newsletter.date)}
                  </small>
                  <p>{newsletter["short-description"]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="newsletter-cta">
            {intl.formatMessage({ id: 'newsletter.want_to_receive', defaultMessage: 'Want to receive the latest updates from the Open Timber Portal?' })}
            &nbsp;<Link href="/newsletter/sign-up"><a>{intl.formatMessage({ id: 'newsletter.subscribe_to', defaultMessage: 'Subscribe to our newsletter' })}</a></Link>.
          </div> */}
        </div>
      </div>
    </Layout>
  );

}

Newsletter.propTypes = {
  url: PropTypes.shape({}).isRequired,
  newsletters: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired
};
Newsletter.getInitialProps = async ({ url, store }) => {
  const { language } = store.getState();
  const newsletters = await API
    .get('newsletters', { locale: language })
    .then((response) => JSONA.deserialize(response));

  return { url, newsletters, language };
}


export default Newsletter;
