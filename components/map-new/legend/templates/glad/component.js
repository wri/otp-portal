import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Datepicker from 'components/ui/datepicker';

class LegendTemplateGLAD extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    setLayerSettings: PropTypes.func.isRequired
  }

  onDateChange = (value, who) => {
    const { activeLayer, setLayerSettings } = this.props;

    const { id, decodeParams } = activeLayer;

    setLayerSettings({
      id,
      settings: {
        decodeParams: {
          ...decodeParams,
          [who]: moment(value).format('YYYY-MM-DD'),
          ...who === 'trimEndDate' && {
            endDate: moment(value).format('YYYY-MM-DD')
          }
        }
      }
    })
  }

  render() {
    const { activeLayer } = this.props;
    const { decodeParams, timelineParams } = activeLayer;

    const { startDate, trimEndDate } = decodeParams;
    const { minDate, maxDate, maxAbsoluteDate, minAbsoluteDate } = timelineParams;

    const min = minDate < minAbsoluteDate ? minAbsoluteDate : minDate;
    const max = maxDate > maxAbsoluteDate ? maxAbsoluteDate : maxDate;
    const trim = trimEndDate > maxAbsoluteDate ? maxAbsoluteDate : trimEndDate;

    return (
      <div className="c-legend-template-glad">
        {typeof window !== 'undefined' &&
          <>
            <span>
              From
            </span>

            <Datepicker
              className="-inline"
              date={moment(startDate < min ? min : startDate)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: min,
                maxDate: trim,
                isOutsideRange: d =>
                  d.isAfter(moment(trim)) ||
                    d.isBefore(moment(min)),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: true
              }}
              onDateChange={(date) => this.onDateChange(date, 'startDate')}
            />

            <span>
              to
            </span>

            <Datepicker
              className="-inline"
              date={moment(trim || max)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: startDate,
                maxDate: max,
                isOutsideRange: d =>
                  d.isAfter(moment(max)) || d.isBefore(moment(startDate)),
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

export default LegendTemplateGLAD;
