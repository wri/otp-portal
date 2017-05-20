import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import Icon from 'components/ui/icon';

export default class HomePage extends React.Component {

  render() {
    return (
      <Page
        title="Home"
        description="Home description..."
        session={this.props.session}
      >
        <h2>Home</h2>
        <Icon name="icon-arrow-down" />
      </Page>
    );
  }

}

HomePage.propTypes = {
  session: PropTypes.object.isRequired
};
