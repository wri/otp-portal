import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

import Datepicker from 'components/ui/datepicker';

import {
  setOperatorDocumentationDate,
  setOperatorDocumentationFMU,
} from 'modules/operators-detail';
import {
  getOperatorDocumentationDate,
  getOperatorDocumentationFMU,
  getFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsFilter({ date, setDate, fmus, FMU, setFMU }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  // const [FMU, setFMU] = useState(null);
  const minDate = process.env.DOCUMENTS_MINDATE;

  return (
    <div className="c-doc-filters">
      <h3>Filter by:</h3>
      {fmus.length > 0 && (
        <span className="filter-option">
          <label htmlFor="business">FMU</label>
          <div className="filters-dropdown">
            <button
              className="dropdown-placeholder"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              {FMU ? FMU.name : 'Select FMUs'}
            </button>

            {isDropdownOpen && (
              <div className="dropdown-content">
                {[null, ...fmus].map((_fmu) => (
                  <option
                    key={_fmu ? _fmu.id : 'no-fmu'}
                    onClick={() => {
                      setFMU(_fmu);
                      setDropdownOpen(false);
                    }}
                  >
                    {_fmu ? _fmu.name : 'Select FMUs'}
                  </option>
                ))}
              </div>
            )}
          </div>
        </span>
      )}
      <span className="filter-option">
        <label htmlFor="business">Date</label>

        <Datepicker
          className="filters-date -inline"
          date={moment(date)}
          dateFormat="dd MMM yyyy"
          settings={{
            numberOfMonths: 1,
            minDate: moment(minDate).add(1, 'days'),
            maxDate: moment(new Date()),
            hideKeyboardShortcutsPanel: true,
            noBorder: true,
            readOnly: false,
          }}
          onDateChange={(d) => setDate(moment(d).format('YYYY-MM-DD'))}
        />
      </span>
    </div>
  );
}

DocumentsFilter.propTypes = {
  date: PropTypes.date,
  setDate: PropTypes.func,
  FMU: PropTypes.object,
  setFMU: PropTypes.func,
  fmus: PropTypes.array,
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    FMU: getOperatorDocumentationFMU(state),
    fmus: getFMUs(state),
  }),
  {
    setDate: setOperatorDocumentationDate,
    setFMU: setOperatorDocumentationFMU,
  }
)(DocumentsFilter);
