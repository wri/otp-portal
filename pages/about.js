import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'utils/general';

import { useIntl } from 'react-intl';

import { fetchApi, settle } from 'services/fetch-api';

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

  const page = about.data;
  const sections = sortBy(page?.sections, 'position');

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
          {(page?.intro || page?.body) && (
            <article className="c-article">
              <div className="row l-row">
                <div className="columns small-12">
                  <div className="content">
                    <div className="description">
                      {page.intro && <p className="bigger georgia">{page.intro}</p>}
                      {page.body && <Html html={page.body} className="bigger georgia" />}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}

          {sections.map((section) => (
            <article
              className="c-article"
              key={section.id}
            >
              <div className="row l-row">
                <div className="columns small-12">
                  <header>
                    <h2 className="c-title">{section.title}</h2>
                  </header>
                  <div className="content">
                    {section.body && (
                      <div className="description">
                        <Html html={section.body} className="bigger georgia" />
                      </div>
                    )}

                    {section.code === 'donors' && renderDonors()}
                    {section.code === 'partners' && renderPartners()}
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

AboutPage.getInitialProps = async ({ language }) => {
  const [about, partners, donors] = await Promise.all([
    settle(fetchApi('pages', { locale: language, params: { 'filter[slug]': 'about', include: 'sections' } }).then((pages) => pages[0] || null), null),
    settle(fetchApi('partners', { params: { 'page[size]': 2000 } }), []),
    settle(fetchApi('donors', { locale: language, params: { 'page[size]': 2000 } }), [])
  ]);

  return { about, partners, donors };
};

AboutPage.propTypes = {
  about: PropTypes.shape({}).isRequired,
  partners: PropTypes.shape({}).isRequired,
  donors: PropTypes.shape({}).isRequired
};

export default AboutPage;
