import React from 'react';
import PropTypes from 'prop-types';

// Components
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';
import Head from 'components/layout/head';
import Icons from 'components/layout/icons';

export default class Layout extends React.Component {
  render() {
    const { title, description } = this.props;

    return (
      <div className="c-page">
        <Head
          title={title}
          description={description}
        />

        <Icons />

        <Header
          session={this.props.session}
        />

        <div className="container">
          {this.props.children}
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
  session: PropTypes.object.isRequired
};
