import React, { useEffect, useCallback } from 'react';
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

const OperatorsDetailFMUsPage = ({
  operatorsDetail,
  operatorObservations,
  getOperatorBySlug,
  router
}) => {
  // Client routing between two operators' fmus pages keeps this page mounted, and
  // getInitialProps loads the new operator without fmus - so re-run on change.
  // Use the store's slug: it updates before router.query, which would still name
  // the previous operator and make this refetch (and restore) the old one.
  const { slug, loadedFMUS } = operatorsDetail.data;
  useEffect(() => {
    if (slug && !loadedFMUS) {
      getOperatorBySlug({ slug, loadFmus: true });
    }
  }, [slug, loadedFMUS]);

  // The URL is the single source of truth for the selected FMU. Shallow, so
  // getInitialProps doesn't re-run; push, so back/forward step through FMUs.
  // No fmuId ("Show all FMUs") drops the param rather than leaving `?fmuId=`
  const onFmuChange = useCallback((fmuId) => {
    const { fmuId: _current, ...query } = router.query;
    router.push(
      { pathname: router.pathname, query: { ...query, ...(fmuId && { fmuId }) } },
      undefined,
      { shallow: true, scroll: false }
    );
  }, [router]);

  return (
    <Layout operatorObservations={operatorObservations}>
      <OperatorsDetailFMUs
        operatorsDetail={operatorsDetail}
        fmuId={router.query.fmuId}
        onFmuChange={onFmuChange}
      />
    </Layout>
  );
};

OperatorsDetailFMUsPage.getInitialProps = getInitialProps;

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
