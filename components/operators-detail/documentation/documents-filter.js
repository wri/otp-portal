import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

import Datepicker from 'components/ui/datepicker';

import { setOperatorDocumentationDate } from 'modules/operators-detail';
import {
  getOperatorDocumentationDate,
  getDocumentationMinDate,
  getFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsFilter({ date, minDate, setDate, fmus }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [FMU, setFMU] = useState(null);

  return (
    <div className="c-doc-filters c-section">
      <h3>Filter by:</h3>
      <span className="filter-option">
        <label htmlFor="business">FMU</label>

        {/* TODO: use react-simple-dropdown? */}
        <div className="filters-dropdown">
          <button
            className="dropdown-placeholder"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            {FMU ? FMU.name : 'Select FMUs'}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-content">
              {fmus.map((_fmu) => (
                <option
                  key={_fmu.id}
                  onClick={() => {
                    setFMU(_fmu);
                    setDropdownOpen(false);
                  }}
                >
                  {_fmu.name}
                </option>
              ))}
            </div>
          )}
        </div>
      </span>
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
  date: PropTypes.string,
  minDate: PropTypes.string,
  setDate: PropTypes.func,
  fmus: PropTypes.array,
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    minDate: getDocumentationMinDate(state),
    fmus: getFMUs(state),
  }),
  { setDate: setOperatorDocumentationDate }
)(DocumentsFilter);
