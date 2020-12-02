import PropTypes from 'prop-types';
import { FILTERS_REFS } from 'constants/observations';
import Filters from 'components/ui/filters';

export default function DBFilters({ parsedFilters, setFilters }) {
  return (
    <div className="c-section">
      <div className="l-container">
        <div className="row l-row">
          <div className="columns small-12">
            <Filters
              options={parsedFilters.options}
              filters={parsedFilters.data}
              setFilters={setFilters}
              filtersRefs={FILTERS_REFS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

DBFilters.propTypes = {
  parsedFilters: PropTypes.object,
  setFilters: PropTypes.func,
};
