import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

// Components
import Layout, { getInitialProps, useOperatorDetail } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

const FmusTab = () => {
  const router = useRouter();
  const { operatorsDetail, loadFmus } = useOperatorDetail();

  // getInitialProps loads the operator without fmu geometries, which only this tab needs.
  // Keyed on the loaded operator's slug: router.query can still name the previous one.
  const { slug, loadedFMUS } = operatorsDetail.data;
  useEffect(() => {
    if (slug && !loadedFMUS) loadFmus();
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
    <OperatorsDetailFMUs
      operatorsDetail={operatorsDetail}
      fmuId={router.query.fmuId}
      onFmuChange={onFmuChange}
    />
  );
};

const OperatorsDetailFMUsPage = ({ operatorsDetail }) => (
  <Layout operatorsDetail={operatorsDetail}>
    <FmusTab />
  </Layout>
);

OperatorsDetailFMUsPage.getInitialProps = getInitialProps;

OperatorsDetailFMUsPage.propTypes = {
  operatorsDetail: PropTypes.object
};

export default OperatorsDetailFMUsPage;
