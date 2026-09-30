import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Input from './input';

// react-datepicker and date-fns are ~54 kB gzipped, so they load on first use, not with the page.
// Hover/focus starts the download so the click rarely waits for it.
const loadPicker = () => import('./picker');

// dayjs locales are registered in _app; only Chinese is named differently there
const DAYJS_LOCALES = { zh: 'zh-cn' };

// The label is formatted with dayjs so it doesn't change once date-fns loads. Only the
// date-fns tokens callers pass (dd, yyyy) need translating; MMM is the same in both.
function formatLabel(date, dateFormat, language) {
  const format = dateFormat.replace('dd', 'DD').replace('yyyy', 'YYYY');
  return date.locale(DAYJS_LOCALES[language] || language).format(format);
}

const noop = () => {};

function Datepicker({ className, onDateChange, settings, theme, date, dateFormat = 'dd MMM', language }) {
  const [Picker, setPicker] = useState(null);
  const label = formatLabel(date, dateFormat, language);

  const open = () => {
    loadPicker().then((m) => setPicker(() => m.default));
  };

  return (
    <div className={classnames('c-datepicker', theme, className)} onMouseEnter={loadPicker}>
      {Picker ? (
        <Picker
          language={language}
          date={date}
          minDate={settings.minDate}
          maxDate={settings.maxDate}
          dateFormat={dateFormat}
          label={label}
          onDateChange={onDateChange}
        />
      ) : (
        <Input label={label} onClick={open} onFocus={loadPicker} onBlur={noop} />
      )}
    </div>
  );
}

Datepicker.propTypes = {
  language: PropTypes.string,
  className: PropTypes.string,
  theme: PropTypes.string,
  date: PropTypes.object,
  dateFormat: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
  settings: PropTypes.object,
};

export default Datepicker;
