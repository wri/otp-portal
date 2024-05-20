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

// const data = [
//   {
//     title: 'Open Timber Portal: Redesigned map of observations, latest updates from Gabon, DRC and Cameroon',
//     date: '2023-11-13',
//     description: 'In this edition of the newsletter, we will share a new improvement that we have recently made on the portal, which now allows users to visualize and access observations from independent forest monitors directly on a map.',
//     image: { url: '/static/images/home/bg-a.jpg' }
//   },
//   {
//     title: 'OTP: Notifications of expiring documents, coordination workshop in Yaoundé',
//     date: '2023-05-09',
//     description: 'Last month, the OTP team was in Yaoundé to participate in a three-day workshop with CED, FLAG and FODER, in order to coordinate efforts and define priority sites for the next independent forest monitoring missions under the OTP-IM CAM project. A brief summary of this meeting is provided below.',
//     image: { url: '/static/images/home/bg-c.jpg' }
//   },

//   {
//     title: 'Newsletter 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     date: '2022-12-04',
//     description: 'Description of newsletter 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit',
//     image: { url: '/static/images/home/bg-intro.jpg' }
//   },
//   {
//     title: 'Newsletter 4 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     date: '2022-07-04',
//     description: 'Description of newsletter 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit',
//     image: { url: '/static/images/static-header/bg-help.jpg' }
//   },
//   {
//     title: 'Newsletter 5',
//     date: '2022-04-04',
//     description: 'Description of newsletter 5',
//     image: { url: '/static/images/static-header/bg-about.jpg' }
//   },
//   {
//     title: 'Newsletter 6',
//     date: '2022-01-04',
//     description: 'Description of newsletter 6',
//     image: { url: '/static/images/static-header/bg-help.jpg' }
//   }
// ]

const Newsletter = ({ url, newsletters }) => {
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

      <div className="c-section">
        <div className="l-container">
          <div className="newsletter-header">
            <h2>Showing {newsletters.length} previous newsletters</h2>

            <Link href="/newsletter/sign-up">
              <a className="card-link c-button -secondary">
                Subscribe to our newsletter
              </a>
            </Link>
          </div>

          <div className="newsletter-grid">
            {newsletters.map(newsletter => (
              // genereate newsletter card with image on top and title and description below
              <div className="newsletter-card">
                <a href={newsletter.attachment.url}>
                  <div className="newsletter-card__image" style={{ backgroundImage: `url(${newsletter.image.thumbnail.url})` }} />
                </a>
                <div className="newsletter-card__content">
                  <h3>
                    <a href={newsletter.attachment.url}>
                      {newsletter.title}
                    </a>
                  </h3>
                  <small className="newsletter-card__date">
                    {new Date(newsletter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })}
                  </small>
                  <p>{newsletter["short-description"]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="newsletter-cta">
            Want to receive the latest updates from the Open Timber Portal? <Link href="/newsletter/sign-up"><a>Subscribe to our newsletter.</a></Link>
          </div>
        </div>
      </div>
    </Layout>
  );

}

Newsletter.propTypes = {
  url: PropTypes.shape({}).isRequired,
  newsletters: PropTypes.array.isRequired
};
Newsletter.getInitialProps = async ({ url, store }) => {
  const { language } = store.getState();
  const newsletters = await API
    .get('newsletters', { locale: language })
    .then((response) => JSONA.deserialize(response));

  return { url, newsletters };
}


export default Newsletter;
