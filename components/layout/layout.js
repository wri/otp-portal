import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Utils
import { initGA, logPageView } from 'utils/analytics';

// Components
import Header from 'components/layout/header';
import Footer from 'components/layout/footer';
import Head from 'components/layout/head';
import Icons from 'components/layout/icons';
import Modal from 'components/ui/modal';
import Notifications from 'components/ui/notifications';
import Toastr from 'react-redux-toastr';
import RouterSpinner from 'components/layout/router-spinner';

export default class Layout extends React.Component {
  componentDidMount() {
    // Google Analytics
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }

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
        />

        <div className={`l-main ${classNames}`}>
          {children}
        </div>

        {footer !== false && <Footer />}

        <Modal />

        <Toastr
          preventDuplicates
          transitionIn="fadeIn"
          transitionOut="fadeOut"
        />

        <Notifications />
        <RouterSpinner />
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
  footer: PropTypes.bool
};
