import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

// Intl
import { injectIntl } from 'react-intl';

import Datepicker from 'components/ui/datepicker';

class LegendTemplateAlerts extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    setLayerSettings: PropTypes.func.isRequired,
    intl: PropTypes.object
  }

  onDateChange = (value, who) => {
    const { activeLayer, setLayerSettings } = this.props;

    const { id, decodeParams } = activeLayer;

    setLayerSettings({
      id,
      settings: {
        decodeParams: {
          ...decodeParams,
          [who]: dayjs(value).format('YYYY-MM-DD'),
          ...(who === 'trimEndDate' && {
            endDate: dayjs(value).format('YYYY-MM-DD')
          })
        }
      }
    })
  }

  render() {
    const { activeLayer, intl } = this.props;
    const { decodeParams, timelineParams } = activeLayer;

    const { startDate, trimEndDate } = decodeParams;
    const { minDate, maxDate, maxAbsoluteDate, minAbsoluteDate } = timelineParams;

    const min = minDate < minAbsoluteDate ? minAbsoluteDate : minDate;
    const max = maxDate > maxAbsoluteDate ? maxAbsoluteDate : maxDate;
    const trim = trimEndDate > maxAbsoluteDate ? maxAbsoluteDate : trimEndDate;

    return (
      <div className="c-legend-template-alerts">
        {typeof window !== 'undefined' &&
          <>
            <span>
              {intl.formatMessage({ id: 'from' })}
            </span>

            <Datepicker
              className="-inline"
              date={dayjs(startDate < min ? min : startDate)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: min,
                maxDate: trim,
                isOutsideRange: d =>
                  d.isAfter(dayjs(trim)) ||
                    d.isBefore(dayjs(min)),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: true
              }}
              onDateChange={(date) => this.onDateChange(date, 'startDate')}
            />

            <span>
              {intl.formatMessage({ id: 'to' })}
            </span>

            <Datepicker
              className="-inline"
              date={dayjs(trim || max)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: startDate,
                maxDate: max,
                isOutsideRange: d =>
                  d.isAfter(dayjs(max)) || d.isBefore(dayjs(startDate)),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: true
              }}
              onDateChange={(date) => this.onDateChange(date, 'trimEndDate')}
            />
          </>
        }

      </div>
    );
  }
}

export default injectIntl(LegendTemplateAlerts);
