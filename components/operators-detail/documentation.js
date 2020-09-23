import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocumentsCertification from 'components/operators-detail/documentation/documents-certification';
import DocumentsProvided from 'components/operators-detail/documentation/documents-provided';
import DocumentsByOperator from 'components/operators-detail/documentation/documents-by-operator';

function OperatorsDetailDocumentation({ operatorsDetail, operatorDocumentation, url, intl }) {
  return (
    <div>
      <div className="c-section">
        <div className="l-container">
          <DocumentsCertification
            // Publication authorization
            id={url.query.id}
          />

          <article className="c-article">
            <header>
              {/* X % valid documents available */}
              <h2 className="c-title">
                {intl.formatMessage({
                  id: 'operator-detail.documents.title'
                }, {
                  percentage: HELPERS_DOC.getPercentage(operatorsDetail.data)
                })}
              </h2>
            </header>

            <div className="content">
              {/* Pie chart */}
              <DocumentsProvided data={operatorDocumentation} />
            </div>
          </article>
        </div>
      </div>

      <div className="c-section">
        <div className="l-container">
          {/* Document sections with cards */}
          <DocumentsByOperator data={operatorDocumentation} id={url.query.id} />
        </div>
      </div>
    </div>
  );
}

OperatorsDetailDocumentation.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorDocumentation: PropTypes.array,
  url: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailDocumentation);
