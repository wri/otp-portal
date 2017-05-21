import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import PageStaticHeader from 'components/page/static-header';

export default class AboutPage extends React.Component {

  render() {
    return (
      <Page
        title="About"
        description="About description..."
        session={this.props.session}
      >
        <PageStaticHeader
          title="About"
          background="/static/images/static-header/about.jpg"
        />
      </Page>
    );
  }

}

AboutPage.propTypes = {
  session: PropTypes.object.isRequired
};
