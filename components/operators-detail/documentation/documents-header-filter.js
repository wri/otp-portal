import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import Datepicker from 'components/ui/datepicker';
import Icon from 'components/ui/icon';

import {
  getOperatorDocumentationDate,
  getOperatorDocumentationFMU,
  getHistoricFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsHeaderFilter({
  date,
  fmus,
  FMU,
  searchText,
  onSearchTextChange,
  onFmuChange,
  onDateChange
}) {
  const intl = useIntl();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const minDate = process.env.DOCUMENTS_MINDATE;

  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        setVisible(window.scrollY > 900);
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="c-doc-header-filters-container">
      <div className="c-doc-header-filters-wrapper">
        <div className="l-container">
          <div className="c-doc-header-filters">
            <div className="c-doc-header-filters__item">
              <div className="filters-dropdown">
                <button
                  className="dropdown-placeholder"
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                  {FMU ? FMU.name : intl.formatMessage({ id: 'filter.fmu_id.placeholder' })}
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
            </div>
            <div className="c-doc-header-filters__item">
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
            </div>
            <div className="c-doc-header-filters__item c-doc-search">
              <div className="search">
                <Icon name="icon-search" />
                <input
                  type="text"
                  placeholder={
                    intl.formatMessage({
                      id: 'operator-detail.documents.search.placeholder',
                      defaultMessage: "Start typing here to search documents..."
                    })
                  }
                  value={searchText}
                  onChange={(e) => onSearchTextChange(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DocumentsHeaderFilter.propTypes = {
  date: PropTypes.string,
  FMU: PropTypes.object,
  fmus: PropTypes.array,
  searchText: PropTypes.string,
  onSearchTextChange: PropTypes.func,
  onFmuChange: PropTypes.func,
  onDateChange: PropTypes.func
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    FMU: getOperatorDocumentationFMU(state),
    fmus: getHistoricFMUs(state),
  })
)(DocumentsHeaderFilter);
