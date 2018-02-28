import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

class TermsPage extends Page {

  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Terms of service"
        description="Terms of service"
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'terms.title' })}
          background="/static/images/static-header/bg-about.jpg"
        />

        <div className="c-section">
          <div className="l-container" />
        </div>
      </Layout>
    );
  }

}

TermsPage.propTypes = {
  intl: intlShape.isRequired
};

export default withTracker(withIntl(withRedux(
  store,
  state => ({

  })
)(TermsPage)));
