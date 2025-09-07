import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import { useIntl } from 'react-intl';

// Redux
import { useSelector } from 'react-redux';
import { getPartners } from 'modules/partners';
import { getDonors } from 'modules/donors';
import { getAbout } from 'modules/about';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import PartnerCard from 'components/ui/partner-card';
import Html from 'components/html';

const AboutPage = () => {
  const intl = useIntl();
  const about = useSelector(state => state.about);
  const partners = useSelector(state => state.partners);
  const donors = useSelector(state => state.donors);
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

AboutPage.getInitialProps = async ({ store }) => {
  await Promise.all([
    store.dispatch(getPartners()),
    store.dispatch(getDonors()),
    store.dispatch(getAbout())
  ]);

  return {};
};

AboutPage.propTypes = {};

export default AboutPage;
