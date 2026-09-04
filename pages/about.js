import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import { useIntl } from 'react-intl';

import API from 'services/api';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import PartnerCard from 'components/ui/partner-card';
import Html from 'components/html';

const AboutPage = ({ about, partners, donors }) => {
  const intl = useIntl();
  const renderDonors = () => {
    const prioritisedDonors = sortBy(donors.data, 'priority') || donors.data;

    return (
      <div className="row l-row -equal-heigth">
        {prioritisedDonors.map(d => (
          <div
            className={'columns small-12 medium-6 large-4'}
            key={d.id}
          >
            <PartnerCard
              {...d}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderPartners = () => {
    return (
      <div className="row l-row -equal-heigth">
        {partners.data.map(p => (
          <div
            className={'columns small-12 medium-6 large-4'}
            key={p.id}
          >
            <PartnerCard
              {...p}
            />
          </div>
        ))}
      </div>
    );
  };

  const aboutPageEntries = sortBy(about.data, 'position') || about.data;

  return (
    <Layout
      title="About"
      description="About description..."
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'about.title' })}
        background="/static/images/static-header/bg-about.jpg"
      />

      <div className="c-section">
        <div className="l-container">
          {aboutPageEntries && aboutPageEntries.map((aboutEntry) => (
            <article
              className="c-article"
              key={aboutEntry.id}
            >
              <div className="row l-row">
                <div className="columns small-12">
                  <header>
                    <h2 className="c-title">{aboutEntry.title}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <Html html={aboutEntry.body} className="bigger georgia" />
                    </div>

                    {aboutEntry.code === 'donors' && renderDonors()}
                    {aboutEntry.code === 'partners' && renderPartners()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// Prerendered per locale. The thunks read state.language for their locale param,
// and a static build gets a fresh store rather than the one _app sets up per request.
// Fetched straight into props rather than through the redux wrapper: that
// serialises a build-time snapshot of the whole store, which HYDRATE then merges
// over live client state - wiping slices the client had already fetched.
export async function getStaticProps({ locale }) {
  const language = locale || 'en';

  const [about, partners, donors] = await Promise.all([
    API.get('about-page-entries', { locale: language }).then(({ data }) => data),
    API.get('partners', { 'page[size]': 2000 }).then(({ data }) => data),
    API.get('donors', { 'page[size]': 2000, locale: language }).then(({ data }) => data)
  ]);

  return {
    props: {
      about: { data: about || [] },
      partners: { data: partners || [] },
      donors: { data: donors || [] }
    },
    revalidate: 60
  };
}

AboutPage.propTypes = {
  about: PropTypes.shape({}).isRequired,
  partners: PropTypes.shape({}).isRequired,
  donors: PropTypes.shape({}).isRequired
};

export default AboutPage;
