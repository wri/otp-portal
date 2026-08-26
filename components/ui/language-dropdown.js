import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import cx from 'classnames';

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
} from 'components/ui/dropdown';
import Icon from 'components/ui/icon';

import { LOCALES } from 'constants/locales';
import { setCookie } from 'services/cookies';

// TODO: for now we will force full reload when changing language
// otherwise we will have to deal with reloading all of the data
// this is also preserving old behaviour
// we should revisit this in the future
const changeLanguage = (e, code) => {
  setCookie('NEXT_LOCALE', code, 365);
  e.preventDefault();
  window.location.href = e.currentTarget.href;
};

const LanguageDropdown = ({ showSelectedCode, className }) => {
  const { asPath, locale } = useRouter();

  // when using custom server asPath is prefixed with locale sometimes, it should not be
  // maybe better to not use custom server
  const fixedAsPath = asPath.replace(`/${locale}/`, '/');
  const selectedLocale = LOCALES.find(l => l.code === locale);

  return (
    <Dropdown className={cx("c-language-dropdown", className)}>
      <DropdownTrigger>
        <Icon name="icon-language" />
        <span>{showSelectedCode ? selectedLocale.code : selectedLocale.name}</span>
      </DropdownTrigger>

      <DropdownContent>
        <ul className="language-dropdown-list">
          {LOCALES.map(l => (
            <li
              key={l.code}
              className="language-dropdown-list-item"
            >
              <Link
                href={fixedAsPath}
                locale={l.code}
                onClick={(e) => changeLanguage(e, l.code)}
              >
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}

LanguageDropdown.propTypes = {
  className: PropTypes.string,
  showSelectedCode: PropTypes.bool
}

LanguageDropdown.defaultProps = {
  showSelectedCode: false
}

export default LanguageDropdown;
