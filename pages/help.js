import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import PageStaticHeader from 'components/page/static-header';

export default class HelpPage extends React.Component {

  render() {
    return (
      <Page
        title="Help"
        description="Help description..."
        session={this.props.session}
      >
        <PageStaticHeader
          title="Help"
          background="/static/images/static-header/about.jpg"
        />
      </Page>
    );
  }

}

HelpPage.propTypes = {
  session: PropTypes.object.isRequired
};
