import React from 'react';
import PropTypes from 'prop-types';
import * as Cookies from 'js-cookie';

import { IntlProvider, injectIntl } from 'react-intl';

import langEn from 'lang/en.json';
import langFr from 'lang/fr.json';
import langZhCN from 'lang/zh_CN.json';
import langJa from 'lang/ja.json';
import langKo from 'lang/ko.json';
import langVi from 'lang/vi.json';
import langPt from 'lang/pt.json';

const MESSAGES = {
  en: langEn,
  fr: langFr,
  zh: langZhCN,
  ja: langJa,
  ko: langKo,
  vi: langVi,
  pt: langPt
};
const LANGUAGES = Object.keys(MESSAGES);

const LANG2LOCALE = {
  en: 'en-GB',
  fr: 'fr-FR',
  pt: 'pt-PT',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  vi: 'vi-VN',
};

const LOCALE2LANG = {
  'en-GB': 'en',
  'fr-FR': 'fr',
  'pt-PT': 'pt',
  'zh-CN': 'zh',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'vi-VN': 'vi',
};

if (process.env.ENV === 'development') {
  // eslint-disable-next-line
  const consoleError = console.error.bind(console);
  // eslint-disable-next-line
  console.error = (message, ...args) => {
    // get rid of [React Intl] messages
    if (typeof message === 'string' && message.startsWith('[React Intl]')) {
      return;
    }
    consoleError(message, ...args);
  };
}

export default function withIntl(Page) {
  const IntlPage = injectIntl(Page);

  return class PageWithIntl extends React.Component {
    static propTypes = {
      language: PropTypes.string,
      now: PropTypes.number,
    };

    static async getInitialProps(context) {
      let props;

      // Get the `locale` from the request object on the server.
      // In the browser, use the same values that the server serialized.
      const { req } = context;

      let language;

      if (req) {
        language = req.locale.language || 'en';
      } else {
        language = LOCALE2LANG[Cookies.get('language')] || 'en';
      }

      language = LANGUAGES.includes(language) ? language : 'en';

      // Always update the current time on page load/transition because the
      // <IntlProvider> will be a new instance even with pushState routing.
      const now = Date.now();

      if (typeof Page.getInitialProps === 'function') {
        props = await Page.getInitialProps(context);
      }

      return { language, now, ...props };
    }

    componentDidMount() {
      // Set language cookie
      Cookies.set('language', LANG2LOCALE[this.props.language], {
        expires: 90,
      });
    }

    render() {
      const { now, language } = this.props;

      return (
        <IntlProvider
          locale={language}
          messages={MESSAGES[language]}
          initialNow={now}
          textComponent="span"
          defaultLocale="en"
        >
          <IntlPage {...this.props} />
        </IntlProvider>
      );
    }
  };
}
