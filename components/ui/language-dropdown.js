import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { connect } from 'react-redux';

import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';

import { injectIntl } from 'react-intl';

import Icon from 'components/ui/icon';

import { LOCALES } from 'constants/locales';
import { setCookie } from 'services/cookies';

// TODO: for now we will force full reload when changing language
// otherwise we will have to deal with reloading all of the data
// this is also preserving old behaviour
// we should revisit this in the future
const LanguageLink = ({ href, locale, children }) => {
  const saveLocale = () => {
    setCookie('NEXT_LOCALE', locale, 365);
  }

  return (
    <a href={href} onClick={saveLocale}>
      {children}
    </a>
  )
}

const LanguageDropdown = ({ intl, showSelectedCode, language }) => {
  const { asPath } = useRouter();

  return (
    <Dropdown className="c-language-dropdown">
      <DropdownTrigger>
        <div className="header-nav-list-item">
          {showSelectedCode && (
            <>
              <Icon name="icon-language" />
              <span>{language}</span>
            </>
          )}

          {!showSelectedCode && (
            <span>
              {intl.formatMessage({ id: 'select_language' })}
            </span>
          )}
        </div>
      </DropdownTrigger>

      <DropdownContent>
        <ul className="language-dropdown-list">
          {LOCALES.map(locale => (
            <li
              key={locale.code}
              className="language-dropdown-list-item"
            >
              <Link href={asPath} passHref locale={locale.code}>
                <LanguageLink locale={locale.code}>
                  {locale.name}
                </LanguageLink>
              </Link>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  )
}

LanguageDropdown.propTypes = {
  intl: PropTypes.object.isRequired,
  showSelectedCode: PropTypes.bool,
  language: PropTypes.string
}

LanguageDropdown.defaultProps = {
  showSelectedCode: false
}

export default injectIntl(
  connect(
    state => ({
      language: state.language,
    }),
    null
  )(LanguageDropdown)
);
