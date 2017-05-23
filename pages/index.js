import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Icon from 'components/ui/icon';

export default class HomePage extends Page {

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
        session={session}
      >
        <h2>Home</h2>
        <Icon name="icon-arrow-down" />
      </Layout>
    );
  }

}

HomePage.propTypes = {
  session: PropTypes.object.isRequired
};
