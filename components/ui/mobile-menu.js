import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';

import LanguageDropdown from 'components/ui/language-dropdown';
import UserDropdown from 'components/ui/user-dropdown';
import Search from 'components/ui/search';

import { useIntl } from 'react-intl';
import UserMenuList from 'components/ui/user-menu-list';
import useUser from 'hooks/use-user';

function MobileMenu({ className }) {
  const intl = useIntl();
  const user = useUser();
  const countries = useSelector(state => state.countries);
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
      href: '/operators',
      name: intl.formatMessage({ id: 'transparency_ranking' })
    },
    {
      href: '/database',
      name: intl.formatMessage({ id: 'producers_documents_database' })
    },
    {
      href: '/observations',
      name: intl.formatMessage({ id: 'observations' })
    },
    {
      href: '/help/overview',
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
      <li>
        <Search />
      </li>
      <li>
        {user.token && (
          <>
            <span>{intl.formatMessage({ id: 'logged_in.trigger' })}</span>
            <UserMenuList />
          </>
        )}
        {!user.token && <UserDropdown displayIcon={false} />}
      </li>
      {elements.map((element, idx) => {
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

                      {item.name}

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

              {element.name}

            </Link>
          </li>
        );
      })}
      <li>
        <LanguageDropdown />
      </li>
    </ul>
  );
}

MobileMenu.propTypes = {
  className: PropTypes.string
};

export default MobileMenu;
