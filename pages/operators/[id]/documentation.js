import React, { useEffect, useState, useRef } from 'react';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { getOperatorDocumentation } from 'modules/operators-detail';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';
import { useDownloadSession } from 'hooks/use-download-session';

import usePrevious from 'hooks/use-previous';
import useUser from 'hooks/use-user';

const OperatorsDetailDocumentationPage = () => {
  const dispatch = useDispatch();
  const operatorsDetail = useSelector((state) => state.operatorsDetail);
  const operatorObservations = useSelector(getParsedObservations);
  const operatorDocumentation = useSelector(getParsedDocumentation);
  const user = useUser();
  const date = operatorsDetail?.date?.toString();
  const previousDate = usePrevious(date);
  useDownloadSession(user.isLoggedIn);

  useEffect(() => {
    if (previousDate && previousDate !== date) {
      const operator = operatorsDetail.data;
      dispatch(getOperatorDocumentation(operator.id));
    }
  }, [date, operatorsDetail.data, dispatch]);

  return (
    <Layout operatorObservations={operatorObservations}>
      <OperatorsDetailDocumentation
        operatorsDetail={operatorsDetail}
        operatorDocumentation={operatorDocumentation}
      />
    </Layout>
  );
};

OperatorsDetailDocumentationPage.getInitialProps = getInitialProps;

export default OperatorsDetailDocumentationPage;
