import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';
import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';

import LanguageDropdown from 'components/ui/language-dropdown';

import { injectIntl, intlShape } from 'react-intl';

function NavigationList({ hideActive, intl, url, className, countries }) {
  const setActive = (pathname) => {
    return classnames({
      '-active': pathname.includes(url.pathname),
    });
  }
  const classNames = classnames({
    'c-navigation-list': true,
    [className]: !!className,
  });
  const navCountries = countries.data.filter(c => (c['required-gov-documents'] || []).length);

  return (
    <ul className={classNames}>
      {hideActive && (
        <li>
          <LanguageDropdown />
        </li>
      )}
      {process.env.FEATURE_COUNTRY_PAGES === 'true' && (
        <li>
          <Dropdown className="c-account-dropdown">
            <DropdownTrigger>
              <div
                className={classnames(
                  'header-nav-list-item',
                  !hideActive ? setActive(['/countries']) : ''
                )}
              >
                <span>
                  {intl.formatMessage({ id: 'countries' })}
                </span>
              </div>
            </DropdownTrigger>

            <DropdownContent>
              <ul className="header-dropdown-list -auto-width">
                {navCountries.map((country) => (
                  <li className="header-dropdown-list-item">
                    <Link href={`/countries/${country.id}`} prefetch={false}>
                      <a>
                        {country.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </DropdownContent>
          </Dropdown>
        </li>
      )}
      <li>
        <Dropdown className="c-account-dropdown">
          <DropdownTrigger>
            <div
              className={classnames(
                'header-nav-list-item',
                !hideActive ? setActive(['/operators', '/database']) : ''
              )}
            >
              <span>
                {intl.formatMessage({ id: 'operators' })}
              </span>
            </div>
          </DropdownTrigger>

          <DropdownContent>
            <ul className="header-dropdown-list">
              <li className="header-dropdown-list-item">
                <Link href="/operators" prefetch={false}>
                  <a>
                    {intl.formatMessage({
                      id: 'transparency_ranking',
                    })}
                  </a>
                </Link>
              </li>
              <li className="header-dropdown-list-item">
                <Link href="/database" prefetch={false}>
                  <a>
                    {intl.formatMessage({
                      id: 'producers_documents_database',
                    })}
                  </a>
                </Link>
              </li>
            </ul>
          </DropdownContent>
        </Dropdown>
      </li>
      <li>
        <Link href="/observations" prefetch={false}>
          <a className={!hideActive ? setActive(['/observations']) : ''}>
            {intl.formatMessage({ id: 'observations' })}
          </a>
        </Link>
      </li>
      <li>
        <Link href="/help" prefetch={false}>
          <a className={!hideActive ? setActive(['/help']) : ''}>
            {intl.formatMessage({ id: 'help' })}
          </a>
        </Link>
      </li>
      <li>
        <Link href="/about" prefetch={false}>
          <a className={!hideActive ? setActive(['/about']) : ''}>
            {intl.formatMessage({ id: 'about' })}
          </a>
        </Link>
      </li>
      {hideActive && (
        <li>
          <Link href="/terms" prefetch={false}>
            <a className={!hideActive ? setActive(['/terms']) : ''}>
              {intl.formatMessage({ id: 'terms' })}
            </a>
          </Link>
        </li>
      )}
      {hideActive && (
        <li>
          <Link href="/newsletter" prefetch={false}>
            <a className={!hideActive ? setActive(['/newsletter']) : ''}>
              {intl.formatMessage({ id: 'newsletter' })}
            </a>
          </Link>
        </li>
      )}
    </ul>
  );
}

NavigationList.propTypes = {
  className: PropTypes.string,
  countries: PropTypes.object,
  hideActive: PropTypes.bool,
  intl: intlShape.isRequired,
  url: PropTypes.object,
};

export default injectIntl(
  connect(
    (state) => ({
      countries: state.countries,
    }),
  )(NavigationList)
);
