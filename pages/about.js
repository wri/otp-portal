import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import { injectIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { getPartners } from 'modules/partners';
import { getDonors } from 'modules/donors';
import { getAbout } from 'modules/about';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import PartnerCard from 'components/ui/partner-card';
import Html from 'components/html';

class AboutPage extends React.Component {
  static async getInitialProps({ url, store }) {
    await Promise.all([
      store.dispatch(getPartners()),
      store.dispatch(getDonors()),
      store.dispatch(getAbout())
    ]);

    return { url };
  }

  renderDonors() {
    const { donors } = this.props;
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
  }

  renderPartners() {
    const { partners } = this.props;

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
  }

  render() {
    const { about, url } = this.props;
    const aboutPageEntries = sortBy(about.data, 'position') || about.data;

    return (
      <Layout
        title="About"
        description="About description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'about.title' })}
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

                      {aboutEntry.code === 'donors' && this.renderDonors()}
                      {aboutEntry.code === 'partners' && this.renderPartners()}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
}

AboutPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  about: PropTypes.shape({}).isRequired,
  partners: PropTypes.shape({}).isRequired,
  donors: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired
};

export default injectIntl(connect(
  state => ({
    about: state.about,
    partners: state.partners,
    donors: state.donors
  }),
  { getPartners, getDonors, getAbout }
)(AboutPage));
