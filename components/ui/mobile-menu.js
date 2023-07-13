import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';

import LanguageDropdown from 'components/ui/language-dropdown';
import UserDropdown from 'components/ui/user-dropdown';

import { injectIntl } from 'react-intl';

function MobileMenu({ intl, className, countries }) {
  const navCountries = countries.data.filter(c => (c['required-gov-documents'] || []).length);

  const elements = [
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
      href: '/terms',
      name: intl.formatMessage({ id: 'terms' })
    },
    {
      href: '/newsletter',
      name: intl.formatMessage({ id: 'newsletter' })
    }
  ].filter(Boolean);

  return (
    <ul
      className={classnames({
        'c-mobile-menu': true,
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
              <span>
                {element.name}
              </span>
              <ul>
                {element.children.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} prefetch={false}>
                      <a>
                        {item.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
        return (
          <li key={idx}>
            <Link href={element.href} prefetch={false}>
              <a>
                {element.name}
              </a>
            </Link>
          </li>
        )
      })}
      <li>
        <UserDropdown displayIcon={false} />
      </li>
      <li>
        <LanguageDropdown />
      </li>
    </ul>
  );
}

MobileMenu.propTypes = {
  className: PropTypes.string,
  countries: PropTypes.object,
  intl: PropTypes.object.isRequired
};

export default injectIntl(
  connect(
    (state) => ({
      countries: state.countries,
    }),
  )(MobileMenu)
);
