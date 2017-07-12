import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

class AboutPage extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="About"
        description="About description..."
        url={url}
        session={session}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title="About the portal"
          background="/static/images/static-header/bg-about.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">Background</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>The Open Timber Portal is an initiative launched by the World Resources Institute to help reduce deforestation and incentivize the production of legal timber.</p>
                      <p>As such, this platform aims to improve access to comprehensive country-specific information about forest management and harvesting, and increase the effectiveness of regulations on illegal logging, such as the US Lacey Act and the EU Timber Regulation (EUTR).</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-6">
                  <header>
                    <h2 className="c-title">Contact us</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>Please get in touch with us with you have any further questions regarding the Open Timber Portal or want to get involved</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>


      </Layout>
    );
  }

}

AboutPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(AboutPage);
