import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';
import Head from 'components/layout/head';
import Icons from 'components/layout/icons';
import Modal from 'components/ui/modal';
import Notifications from 'components/ui/notifications';
import RouterSpinner from 'components/layout/router-spinner';

const Toastr = dynamic(() => import('react-redux-toastr'), { ssr: false });

const Layout = ({ title, description, url, children, className, footer, toastr }) => {
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
      />

      <div className={`l-main ${classNames}`}>
        {children}
      </div>

      {footer !== false && <Footer />}

      <Modal />

      {toastr && <Toastr
        preventDuplicates
        transitionIn="fadeIn"
        transitionOut="fadeOut"
      />}

      <Notifications />
      <RouterSpinner />
    </div>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  url: PropTypes.object.isRequired,
  className: PropTypes.string,
  footer: PropTypes.bool,
  toastr: PropTypes.object
};

export default connect((state) => ({ toastr: state.toastr }))(Layout);
