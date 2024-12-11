import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocumentsByCountry from 'components/countries-detail/documentation/documents-by-country';
import Html from 'components/html';

function OperatorsDetailDocumentation ({ countryDocumentation, vpaOverview }) {
  const router = useRouter();
  const groupedByType = HELPERS_DOC.getGroupedByType(countryDocumentation);

  return (
    <div>
      <div className="c-section">
        <div className="l-container">
          {vpaOverview && <Html html={vpaOverview} className="georgia" /> }
          <DocumentsByCountry data={groupedByType['gov-documents']} id={router.query.id} />
        </div>
      </div>
    </div>
  );
}

OperatorsDetailDocumentation.propTypes = {
  countryDocumentation: PropTypes.array,
  vpaOverview: PropTypes.string
};

export default OperatorsDetailDocumentation;
