import React from 'react';
import PropTypes from 'prop-types';
import Page from 'components/layout/page';
import PageStaticHeader from 'components/page/static-header';

export default class ObservatorsPage extends React.Component {

  render() {
    return (
      <Page
        title="Observators"
        description="Observators description..."
        session={this.props.session}
      >
        <PageStaticHeader
          title="Observators"
          background="/static/images/static-header/about.jpg"
        />
      </Page>
    );
  }

}

ObservatorsPage.propTypes = {
  session: PropTypes.object.isRequired
};
