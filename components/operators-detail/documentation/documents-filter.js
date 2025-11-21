import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import Datepicker from 'components/ui/datepicker';

import {
  getOperatorDocumentationDate,
  getOperatorDocumentationFMU,
  getHistoricFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsFilter({
  children,
  date,
  showDate,
  fmus,
  FMU,
  showFMU,
  onFmuChange,
  onDateChange
}) {
  const intl = useIntl();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const minDate = process.env.DOCUMENTS_MINDATE;

  const selectedFmu = FMU && fmus && fmus.find(f => f.id === FMU.id);

  return (
    <div className="c-doc-filters">
      <h3>{intl.formatMessage({ id: 'filter.title' })}</h3>
      <div className="filter-options">
        {fmus.length > 0 && showFMU && (
          <span className="filter-option">
            <label htmlFor="business">{intl.formatMessage({ id: 'fmu' })}</label>
            <div className="filters-dropdown">
              <button
                className="dropdown-placeholder"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                {selectedFmu ? selectedFmu.name : intl.formatMessage({ id: 'filter.fmu_id.placeholder' })}
              </button>

              {isDropdownOpen && (
                <div className="dropdown-content">
                  {[null, ...fmus].map((_fmu) => (
                    <option
                      key={_fmu ? _fmu.id : 'no-fmu'}
                      onClick={() => {
                        onFmuChange && onFmuChange(_fmu?.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {_fmu ? _fmu.name : intl.formatMessage({ id: 'filter.fmu_id.placeholder' })}
                    </option>
                  ))}
                </div>
              )}
            </div>
          </span>
        )}

        {showDate && (
          <span className="filter-option">
            <label htmlFor="business">{intl.formatMessage({ id: 'date' })}</label>

            <Datepicker
              className="filters-date -inline"
              date={dayjs(date)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: dayjs(minDate).add(1, 'days'),
                maxDate: dayjs(),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: false,
              }}
              onDateChange={(d) => onDateChange && onDateChange(d)}
            />
          </span>
        )}

        {children}
      </div>
    </div>
  );
}

DocumentsFilter.propTypes = {
  children: PropTypes.any,
  date: PropTypes.string,
  FMU: PropTypes.object,
  fmus: PropTypes.array,
  showDate: PropTypes.bool,
  showFMU: PropTypes.bool,
  onFmuChange: PropTypes.func,
  onDateChange: PropTypes.func
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    FMU: getOperatorDocumentationFMU(state),
    fmus: getHistoricFMUs(state),
  })
)(DocumentsFilter);
