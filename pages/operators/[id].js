import PropTypes from 'prop-types';

const OperatorDetailRedirect = () => {
  return null;
}

OperatorDetailRedirect.getInitialProps = async ({ url }) => {
  return { redirectTo: `${url.asPath}/overview` };
}

OperatorDetailRedirect.propTypes = {
  url: PropTypes.object.isRequired,
};

export default OperatorDetailRedirect
