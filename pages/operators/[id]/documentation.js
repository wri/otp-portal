import React from 'react';
import PropTypes from 'prop-types';

// Components
import Layout, { getInitialProps, useOperatorDetail } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';
import { useDownloadSession } from 'hooks/use-download-session';

import useUser from 'hooks/use-user';

const DocumentationTab = () => {
  const { operatorsDetail, documentation } = useOperatorDetail();

  return (
    <OperatorsDetailDocumentation
      operatorsDetail={operatorsDetail}
      operatorDocumentation={documentation}
    />
  );
};

const OperatorsDetailDocumentationPage = ({ operatorsDetail }) => {
  const user = useUser();
  useDownloadSession(user.isLoggedIn);

  return (
    <Layout operatorsDetail={operatorsDetail}>
      <DocumentationTab />
    </Layout>
  );
};

OperatorsDetailDocumentationPage.getInitialProps = getInitialProps;

OperatorsDetailDocumentationPage.propTypes = {
  operatorsDetail: PropTypes.object
};

export default OperatorsDetailDocumentationPage;
