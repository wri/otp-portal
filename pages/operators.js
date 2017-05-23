import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import PageStaticHeader from 'components/page/static-header';

export default class OperatorsPage extends React.Component {

  render() {
    return (
      <Page
        title="Operators"
        description="Operators description..."
        session={this.props.session}
      >
        <PageStaticHeader
          title="Operators"
          background="/static/images/static-header/about.jpg"
        />
      </Page>
    );
  }

}

OperatorsPage.propTypes = {
  session: PropTypes.object.isRequired
};
