import React from 'react';
import PropTypes from 'prop-types';

class OperatorsDetail extends React.Component {
  static async getInitialProps({ url }) {
    const {tab} = url.query;

    return { redirectTo: `${url.asPath.replace(`/${tab}`, '/overview')}` };
  }
}

OperatorsDetail.propTypes = {
  url: PropTypes.object.isRequired,
};

export default OperatorsDetail;
