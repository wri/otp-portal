// Registers the dayjs locales for the app's languages. Imported only by the components that
// format localised dates, so the locale files stay out of _app and off every other page.
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';

// the app's language codes match dayjs's, except Chinese
const DAYJS_LOCALES = { zh: 'zh-cn' };

export function dayjsLocale(language) {
  return DAYJS_LOCALES[language] || language;
}
