import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/page/static-header';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getObservations } from 'modules/observations';


class ObservationsPage extends Page {

  componentDidMount() {
    const { dispatch, observations } = this.props;
    if (isEmpty(observations.data)) {
      dispatch(getObservations());
    }
  }

  render() {
    const { url, session, observations } = this.props;
    console.info(observations);

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
        session={session}
      >
        <StaticHeader
          title="Observations"
          background="/static/images/static-header/bg-help.jpg"
        />
      </Layout>
    );
  }

}

ObservationsPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store,
  state => ({
    observations: state.observations
  })
)(ObservationsPage);
