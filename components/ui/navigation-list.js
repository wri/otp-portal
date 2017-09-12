import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';

import { injectIntl, intlShape } from 'react-intl';

class NavigationList extends React.Component {
  setActive(pathname) {
    const { url } = this.props;
    return classnames({
      '-active': (pathname.includes(url.pathname))
    });
  }

  render() {
    const { hideActive, className } = this.props;
    const classNames = classnames({
      'c-navigation-list': true,
      [className]: !!className
    });

    return (
      <ul className={classNames}>
        <li>
          <Link prefetch href="/operators">
            <a className={!hideActive ? this.setActive(['/operators', '/operators-detail']) : ''}>
              {this.props.intl.formatMessage({ id: 'operators' })}
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/observations">
            <a className={!hideActive ? this.setActive(['/observations']) : ''}>
              {this.props.intl.formatMessage({ id: 'observations' })}
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/help">
            <a className={!hideActive ? this.setActive(['/help']) : ''}>
              {this.props.intl.formatMessage({ id: 'help' })}
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/about">
            <a className={!hideActive ? this.setActive(['/about']) : ''}>
              {this.props.intl.formatMessage({ id: 'about' })}
            </a>
          </Link>
        </li>
      </ul>
    );
  }
}

NavigationList.propTypes = {
  url: PropTypes.object,
  hideActive: PropTypes.bool,
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(NavigationList);
