import { translations } from 'utils/translations';

// The output is identical for a given locale, so serialise each one only once.
const scripts = {};

function getScript(locale) {
  if (!scripts[locale]) {
    scripts[locale] = `window.OTP_PORTAL_TRANSLATIONS = ${JSON.stringify(translations[locale])};`;
  }

  return scripts[locale];
}

export async function getServerSideProps({ res, locale, query }) {
  const script = getScript(locale);

  res.setHeader("Content-Type", "text/javascript");
  // _document.js appends ?v=<buildId>, so a versioned URL is safe to cache forever:
  // a new build produces a new URL. Unversioned requests (dev) stay uncached.
  if (query.v) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  res.write(script);
  res.end();

  return {
    props: {},
  };
}

export default function Translations() {}
