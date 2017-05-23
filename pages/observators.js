import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

export default class ObservatorsPage extends Page {

  render() {
    return (
      <Layout
        title="Observators"
        description="Observators description..."
        session={this.props.session}
      >
        <StaticHeader
          title="Observators"
          background="/static/images/static-header/bg-help.jpg"
        />
      </Layout>
    );
  }

}

ObservatorsPage.propTypes = {
  session: PropTypes.object.isRequired
};
