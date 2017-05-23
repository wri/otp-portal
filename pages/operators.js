import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

export default class OperatorsPage extends Page {

  render() {
    return (
      <Layout
        title="Operators"
        description="Operators description..."
        session={this.props.session}
      >
        <StaticHeader
          title="Operators"
          background="/static/images/static-header/about.jpg"
        />
      </Layout>
    );
  }

}

OperatorsPage.propTypes = {
  session: PropTypes.object.isRequired
};
