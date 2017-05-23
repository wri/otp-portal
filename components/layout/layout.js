import React from 'react';
import PropTypes from 'prop-types';

// Components
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';
import Head from 'components/layout/head';
import Icons from 'components/layout/icons';

export default class Layout extends React.Component {
  render() {
    const { title, description, url, session, children } = this.props;

    return (
      <div className="c-page">
        <Head
          title={title}
          description={description}
        />

        <Icons />

        <Header
          url={url}
          session={session}
        />

        <div className="l-main">
          {children}
        </div>

        <Footer />
      </div>
    );
  }

}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  session: PropTypes.object.isRequired,
  url: PropTypes.object.isRequired
};
