import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

export default class OperatorsPage extends Page {

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        session={session}
      >
        <StaticHeader
          title="Operators"
          background="/static/images/static-header/bg-help.jpg"
        />
      </Layout>
    );
  }

}

OperatorsPage.propTypes = {
  session: PropTypes.object.isRequired
};
