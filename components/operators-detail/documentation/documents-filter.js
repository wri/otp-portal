import React, { useState } from 'react';
import moment from 'moment';
import Datepicker from 'components/ui/datepicker';

function DocumentsFilter() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [date, setDate] = useState(moment('2020-11-13'));

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
            Select FMUs
          </button>

          {isDropdownOpen && (
            <ul className="dropdown-content">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={`option-${n}`}>Option {n}</li>
              ))}
            </ul>
          )}
        </div>
      </span>
      <span className="filter-option">
        <label htmlFor="business">Date</label>

        <Datepicker
          className="filters-date -inline"
          date={date}
          dateFormat="dd MMM yyyy"
          settings={{
            numberOfMonths: 1,
            minDate: new Date('2020-11-09'),
            maxDate: new Date(),
            // isOutsideRange: (d) =>
            //   d.isAfter(moment(trim)) || d.isBefore(moment(min)),
            hideKeyboardShortcutsPanel: true,
            noBorder: true,
            readOnly: false,
          }}
          onDateChange={(d) => setDate(moment(d))}
        />
      </span>
    </div>
  );
}

export default DocumentsFilter;
