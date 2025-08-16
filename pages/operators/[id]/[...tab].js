import React from 'react';

const OperatorsDetail = () => {
  return null;
};

OperatorsDetail.getInitialProps = async ({ query, asPath }) => {
  const { tab } = query;

  return { redirectTo: `${asPath.replace(`/${tab}`, '/overview')}` };
};

export default OperatorsDetail;
