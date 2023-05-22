import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';

import { injectIntl, intlShape } from 'react-intl';

const LanguageDropdown = ({ intl, showSelectedCode, language }) => {
  return (
    <Dropdown className="c-language-dropdown">
      <DropdownTrigger>
        <div className="header-nav-list-item">
          <span>
            {showSelectedCode && (language)}
            {!showSelectedCode && intl.formatMessage({ id: 'select_language' })}
          </span>
        </div>
      </DropdownTrigger>

      <DropdownContent>
        <ul className="language-dropdown-list">
          <li className="language-dropdown-list-item">
            <a href="?language=en-GB">English</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=fr-FR">Français</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=pt-PT">Português</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=zh-CN">中文</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=ja-JP">日本語</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=ko-KR">한국어</a>
          </li>
          <li className="language-dropdown-list-item">
            <a href="?language=vi-VN">Tiếng Việt</a>
          </li>
        </ul>
      </DropdownContent>
    </Dropdown>
  )
}

LanguageDropdown.propTypes = {
  intl: intlShape.isRequired,
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
