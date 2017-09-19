import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Components
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';
import Head from 'components/layout/head';
import Icons from 'components/layout/icons';
import Modal from 'components/ui/modal';
import Toastr from 'react-redux-toastr';

if (process.env.NODE_ENV !== 'production') {
  // TODO
  // If you want to debug the permonace
  // we should check avoidables re-renders
  // const { whyDidYouUpdate } = require('why-did-you-update');
  // whyDidYouUpdate(React);
}

export default class Layout extends React.Component {
  render() {
    const { title, description, url, children, className, footer } = this.props;

    const classNames = classnames({
      [className]: !!className
    });

    return (
      <div className={`l-page c-page ${classNames}`}>
        <Head
          title={title}
          description={description}
        />

        <Icons />

        <Header
          url={url}
          searchList={this.props.searchList}
        />

        <div className={`l-main ${classNames}`}>
          {children}
        </div>

        {footer !== false && <Footer />}

        <Modal />

        <Toastr
          transitionIn="fadeIn"
          transitionOut="fadeOut"
        />
      </div>
    );
  }

}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  url: PropTypes.object.isRequired,
  className: PropTypes.string,
  searchList: PropTypes.array,
  footer: PropTypes.bool
};
