import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

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
    const { url } = this.props;

    return (
      <Layout
        title="About"
        description="About description..."
        url={url}
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
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.background' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.background.description1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'about.background.description2' })}</p>
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
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.contactus' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.contactus.description1' })}</p>
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
  session: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default withIntl(withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(AboutPage));
