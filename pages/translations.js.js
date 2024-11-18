const langFolder = process.env.NODE_ENV === 'production' ? 'compiled/' : '';
const translations = {
  en: require(`lang/${langFolder}en.json`),
  fr: require(`lang/${langFolder}fr.json`),
  pt: require(`lang/${langFolder}pt.json`),
  ja: require(`lang/${langFolder}ja.json`),
  ko: require(`lang/${langFolder}ko.json`),
  vi: require(`lang/${langFolder}vi.json`),
  zh: require(`lang/${langFolder}zh_CN.json`)
}

export async function getServerSideProps({ res, locale }) {
  const script = `
    window.OTP_PORTAL_TRANSLATIONS = ${JSON.stringify(translations[locale])};
  `;

  res.setHeader("Content-Type", "text/javascript");
  res.write(script);
  res.end();

  return {
    props: {},
  };
}

export default function Translations() {}
