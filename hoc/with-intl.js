import React from 'react';
import PropTypes from 'prop-types';

import { loadGetInitialProps } from 'next/dist/lib/utils';

import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';

import langEn from 'lang/en.json';
import langFr from 'lang/fr.json';

import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';

const LANGUAGES = { en, fr };
const MESSAGES = { en: langEn, fr: langFr };


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
      if (typeof Page.getInitialProps === 'function') {
        props = await Page.getInitialProps(context);
      }

      // Get the `locale` from the request object on the server.
      // In the browser, use the same values that the server serialized.
      const { req, res } = context;

      let language = 'en';
      if (req) {
        language = req.query.language || req.cookies.language || req.locale.language;
      } else {
        language = window.__NEXT_DATA__.props.initialProps.language;
      }

      // // Save the lang in a cookie named 'language'
      // // TODO: is it working?
      if (res) {
        res.cookie('language', language, { maxAge: 10800 });
      }


      // Always update the current time on page load/transition because the
      // <IntlProvider> will be a new instance even with pushState routing.
      const now = Date.now();

      return { language, now, ...props };
    }

    render() {
      const { now, language } = this.props;

      return (
        <IntlProvider
          locale={language}
          messages={MESSAGES[language]}
          initialNow={now}
        >
          <IntlPage {...this.props} />
        </IntlProvider>
      );
    }
  };
}
