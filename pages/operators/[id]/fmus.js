import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';

// Redux
import { connect } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';

import { getOperatorBySlug } from 'modules/operators-detail';

class OperatorsDetailFMUsPage extends React.Component {
  static getInitialProps = getInitialProps;

  componentDidMount() {
    const { operatorsDetail, getOperatorBySlug, router } = this.props;
    if (!operatorsDetail.data.loadedFMUS) {
      getOperatorBySlug(router.query.id, true);
    }
  }

  render() {
    const {
      operatorsDetail,
      operatorObservations,
    } = this.props;

    return (
      <Layout operatorObservations={operatorObservations}>
        <OperatorsDetailFMUs operatorsDetail={operatorsDetail} />
      </Layout>
    );
  }
}

OperatorsDetailFMUsPage.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  getOperatorBySlug: PropTypes.func.isRequired
};

export default withRouter(connect(
  (state) => ({
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state)
  }), { getOperatorBySlug }
)(OperatorsDetailFMUsPage));
