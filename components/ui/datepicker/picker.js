import React from 'react';
import PropTypes from 'prop-types';
import ReactDatePicker, { registerLocale } from 'react-datepicker';

import esLocale from 'date-fns/locale/es';
import frLocale from 'date-fns/locale/fr';
import ptLocale from 'date-fns/locale/pt';
import jaLocale from 'date-fns/locale/ja';
import koLocale from 'date-fns/locale/ko';
import viLocale from 'date-fns/locale/vi';
import zhCNLocale from 'date-fns/locale/zh-CN';

import Input from './input';

// loaded on demand with this chunk; css/components/ui/_datepicker.scss holds our overrides
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', esLocale);
registerLocale('fr', frLocale);
registerLocale('pt', ptLocale);
registerLocale('ja', jaLocale);
registerLocale('ko', koLocale);
registerLocale('vi', viLocale);
registerLocale('zh', zhCNLocale);

// Mounted on the first click, so it opens straight away and takes focus from the placeholder button
export default function Picker({ language, date, minDate, maxDate, dateFormat, label, onDateChange }) {
  return (
    <ReactDatePicker
      locale={language}
      className="datepicker-input"
      selected={date.toDate()}
      minDate={new Date(minDate)}
      maxDate={new Date(maxDate)}
      dateFormat={dateFormat}
      showMonthDropdown
      showYearDropdown
      startOpen
      autoFocus
      // Custom components
      customInput={<Input label={label} />}
      // Popper
      popperPlacement="bottom-start"
      popperClassName="c-datepicker-popper"
      portalId="__next"
      // Func
      onSelect={onDateChange}
    />
  );
}

Picker.propTypes = {
  language: PropTypes.string,
  date: PropTypes.object.isRequired,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
  dateFormat: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired
};
