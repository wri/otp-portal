import React from 'react';
import PropTypes from 'prop-types';
import * as Cookies from 'js-cookie';

import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';

import langEn from 'lang/en.json';
import langFr from 'lang/fr.json';
import langZhCN from 'lang/zh_CN.json';

import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';
import zh from 'react-intl/locale-data/zh';


const LANGUAGES = { en, fr, zh };
const MESSAGES = { en: langEn, fr: langFr, zh: langZhCN };

const LANG2LOCALE = {
  en: 'en-GB',
  fr: 'fr-FR',
  zh: 'zh-CN'
};
const LOCALE2LANG = {
  'en-GB': 'en',
  'fr-FR': 'fr',
  'zh-CN': 'zh'
};


// Register React Intl's locale data for the user's locale in the browser
if (typeof window !== 'undefined') {
  Object.keys(LANGUAGES).forEach((lang) => {
    addLocaleData(LANGUAGES[lang]);
  });
}

export default function withIntl(Page) {
  const IntlPage = injectIntl(Page);

  return class PageWithIntl extends React.Component {
    static propTypes = {
      language: PropTypes.string,
      now: PropTypes.number
    }

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

      language = (Object.keys(LANGUAGES).includes(language)) ? language : 'en';

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
      Cookies.set('language', LANG2LOCALE[this.props.language], { expires: 90 });
    }

    render() {
      const { now, language } = this.props;

      return (
        <IntlProvider
          locale={language}
          messages={MESSAGES[language]}
          initialNow={now}
          defaultLocale="en"
        >
          <IntlPage {...this.props} />
        </IntlProvider>
      );
    }
  };
}
