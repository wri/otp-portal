import React from 'react';

class OperatorsDetail extends React.Component {
  static async getInitialProps({ query, asPath }) {
    const { tab } = query;

    return { redirectTo: `${asPath.replace(`/${tab}`, '/overview')}` };
  }
}

export default OperatorsDetail;
