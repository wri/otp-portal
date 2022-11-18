import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocumentsByCountry from 'components/countries-detail/documentation/documents-by-country';

function OperatorsDetailDocumentation ({ countryDocumentation, url }) {
  const groupedByType = HELPERS_DOC.getGroupedByType(countryDocumentation);

  return (
    <div>
      <div className="c-section">
        <div className="l-container">
          <DocumentsByCountry data={groupedByType['gov-documents']} id={url.query.id} />
        </div>
      </div>
    </div>
  );
}

OperatorsDetailDocumentation.propTypes = {
  countryDocumentation: PropTypes.array,
  url: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailDocumentation);
