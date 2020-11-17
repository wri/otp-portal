import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

import Datepicker from 'components/ui/datepicker';

import { setOperatorDocumentationDate } from 'modules/operators-detail';
import { getOperatorDocumentationDate } from 'selectors/operators-detail/documentation';

function DocumentsFilter({ date, setDate }) {
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
            {FMU || 'Select FMUs'}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-content">
              {[1, 2, 3, 4, 5].map((n) => (
                <option
                  key={`option-${n}`}
                  onClick={() => {
                    setFMU(`Option ${n}`);
                    setDropdownOpen(false);
                  }}
                >
                  Option {n}
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
            // TODO: specify minDate
            minDate: new Date('2019-11-09'),
            maxDate: new Date(),
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
  setDate: PropTypes.func,
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
  }),
  { setDate: setOperatorDocumentationDate }
)(DocumentsFilter);
