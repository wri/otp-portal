import React from 'react';
import PropTypes from 'prop-types';
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';

export default class Layout extends React.Component {

  render() {
    return (
      <div>
        <Header session={this.props.session} />
        <div className="container">
          {this.props.children}
        </div>
        <Footer />
      </div>
    );
  }

}

Layout.propTypes = {
  session: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired
};
