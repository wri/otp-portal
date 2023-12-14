import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import classnames from 'classnames';

import frLocale from 'date-fns/locale/fr';
import ptLocale from 'date-fns/locale/pt';
import jaLocale from 'date-fns/locale/ja';
import koLocale from 'date-fns/locale/ko';
import viLocale from 'date-fns/locale/vi';
import zhCNLocale from 'date-fns/locale/zh-CN';

import Input from './input';

registerLocale('fr', frLocale);
registerLocale('pt', ptLocale);
registerLocale('ja', jaLocale);
registerLocale('ko', koLocale);
registerLocale('vi', viLocale);
registerLocale('zh', zhCNLocale);

class Datepicker extends PureComponent {
  render() {
    const {
      className,
      onDateChange,
      settings,
      theme,
      date,
      dateFormat,
      language
    } = this.props;
    const { minDate, maxDate } = settings;

    return (
      <div
        ref={(ref) => {
          this.ref = ref;
        }}
        className={classnames('c-datepicker', theme, className)}
      >
        <ReactDatePicker
          locale={language}
          className="datepicker-input"
          selected={date.toDate()}
          minDate={new Date(minDate)}
          maxDate={new Date(maxDate)}
          dateFormat={dateFormat || 'dd MMM'}
          showMonthDropdown
          showYearDropdown
          // Custom components
          customInput={<Input />}
          // Popper
          popperPlacement="bottom-start"
          popperClassName="c-datepicker-popper"
          popperModifiers={{
            flip: {
              enabled: false,
            },
            offset: {
              enabled: true,
              offset: '0px, -15px',
            },
            preventOverflow: {
              enabled: true,
              escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
              boundariesElement: 'viewport',
            },
          }}
          portalId="__next"
          // Func
          onSelect={onDateChange}
          // renderCustomHeader={this.renderCalendarHeader}
        />
      </div>
    );
  }
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
