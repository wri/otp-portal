import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import Datepicker from 'components/ui/datepicker';
import Icon from 'components/ui/icon';

import {
  setOperatorDocumentationDate,
  setOperatorDocumentationFMU,
} from 'modules/operators-detail';
import {
  getOperatorDocumentationDate,
  getOperatorDocumentationFMU,
  getHistoricFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsHeaderFilter({
  date,
  setDate,
  fmus,
  FMU,
  setFMU,
  searchText,
  setSearchText,
  intl
}) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const minDate = process.env.DOCUMENTS_MINDATE;

  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        setVisible(window.pageYOffset > 900);
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="c-doc-header-filters-container">
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
                        setFMU(_fmu);
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
                onChange={(e) => setSearchText(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DocumentsHeaderFilter.propTypes = {
  date: PropTypes.string,
  setDate: PropTypes.func,
  FMU: PropTypes.object,
  setFMU: PropTypes.func,
  fmus: PropTypes.array,
  searchText: PropTypes.string,
  setSearchText: PropTypes.func,
  intl: intlShape
};

export default injectIntl(connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    FMU: getOperatorDocumentationFMU(state),
    fmus: getHistoricFMUs(state),
  }),
  {
    setDate: setOperatorDocumentationDate,
    setFMU: setOperatorDocumentationFMU,
  }
)(DocumentsHeaderFilter));
