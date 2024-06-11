import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
} from 'components/ui/dropdown';
import LanguageDropdown from 'components/ui/language-dropdown';

import { injectIntl } from 'react-intl';

function NavigationList({ footer, intl, url, className, countries }) {
  const setActive = (pathname) => {
    if (footer) return '';

    return classnames({
      '-active': pathname.includes(url.pathname),
    });
  }
  const navCountries = countries.data.filter(c => (c['required-gov-documents'] || []).length);

  const elements = [
    footer && LanguageDropdown,
    process.env.FEATURE_COUNTRY_PAGES === 'true' && {
      name: intl.formatMessage({ id: 'countries' }),
      children: navCountries.map((country) => ({
        name: country.name,
        href: `/countries/${country.id}`
      }))
    },
    {
      name: intl.formatMessage({ id: 'operators' }),
      children: [
        {
          href: '/operators',
          name: intl.formatMessage({ id: 'transparency_ranking' })
        },
        {
          href: '/database',
          name: intl.formatMessage({ id: 'producers_documents_database' })
        }
      ]
    },
    {
      href: '/observations',
      name: intl.formatMessage({ id: 'observations' })
    },
    {
      href: '/help',
      name: intl.formatMessage({ id: 'help' })
    },
    {
      href: '/about',
      name: intl.formatMessage({ id: 'about' })
    },
    {
      href: '/newsletter',
      name: intl.formatMessage({ id: 'newsletter' })
    }
  ].filter(Boolean);

  return (
    <ul
      className={classnames({
        'c-navigation-list': true,
        [className]: !!className,
      })}
    >
      {elements.map((element, idx) => {
        if (typeof element === 'function') {
          const Element = element;

          return (
            <li key={idx}>
              <Element />
            </li>
          );
        }

        if (element.children) {
          return (
            <li key={idx}>
              <Dropdown className="header-dropdown">
                <DropdownTrigger>
                  <div
                    className={classnames(
                      'header-nav-list-item',
                      setActive(element.children.map(el => el.href))
                    )}
                  >
                    <span>
                      {element.name}
                    </span>
                  </div>
                </DropdownTrigger>

                <DropdownContent>
                  <ul className="header-dropdown-list">
                    {element.children.map((item) => (
                      <li key={item.href} className="header-dropdown-list-item">
                        <Link href={item.href} prefetch={false}>
                          <a>
                            {item.name}
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </DropdownContent>
              </Dropdown>
            </li>
          );
        }
        return (
          <li key={idx}>
            <Link href={element.href} prefetch={false}>
              <a className={setActive([element.href])}>
                {element.name}
              </a>
            </Link>
          </li>
        )
      })}
    </ul>
  );
}

NavigationList.propTypes = {
  className: PropTypes.string,
  countries: PropTypes.object,
  footer: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  url: PropTypes.object,
};

NavigationList.defaultProps = {
  footer: false
}

export default injectIntl(
  connect(
    (state) => ({
      countries: state.countries,
    }),
  )(NavigationList)
);
