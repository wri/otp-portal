import React from 'react';
import PropTypes from 'prop-types';

// Libraries
let GA;
if (typeof window !== 'undefined') {
  /* eslint-disable global-require */
  GA = require('react-ga');
  /* eslint-enable global-require */
  GA.initialize('UA-48182293-6', { debug: false });
}

const withTracker = (Page, options = {}) => {
  const trackPage = (page) => {
    GA.event({
      page,
      category: page,
      action: 'Navigation',
      label: page,
      ...options,
    });
    GA.pageview(page);
  };

  const HOC = class extends React.Component {
    static async getInitialProps(context) {
      let props;
      if (typeof Page.getInitialProps === 'function') {
        props = await Page.getInitialProps(context);
      }

      return { ...props };
    }

    componentDidMount() {
      const page = this.props.url.pathname;
      trackPage(page);
    }

    componentDidUpdate(prevProps) {
      const currentPage = this.props.url.pathname;
      const prevPage = prevProps.url.pathname;

      if (currentPage !== prevPage) {
        trackPage(currentPage);
      }
    }

    render() {
      return <Page {...this.props} />;
    }
  };

  HOC.propTypes = {
    url: PropTypes.object,
  };

  return HOC;
};

export default withTracker;
