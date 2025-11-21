import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';

// Intl
import { useIntl } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';
import { setUrlParam } from 'utils/url';

import useUser from 'hooks/use-user';

import {
  setOperatorDocumentationDate,
  setOperatorDocumentationFMU,
} from 'modules/operators-detail';

import {
  getHistoricFMUs,
} from 'selectors/operators-detail/documentation';

// Components
import DocumentsPublicationAuthorization from '~/components/operators-detail/documentation/documents-publication-authorization';
import DocumentsProvidedChart from '~/components/operators-detail/documentation/documents-provided-chart';
import DocumentsByOperator from 'components/operators-detail/documentation/documents-by-operator';
import DocumentsTimeline from 'components/operators-detail/documentation/documents-timeline';
import DocumentStatusBar from 'components/operators-detail/documentation/documents-bars';
import DocumentsFilter from 'components/operators-detail/documentation/documents-filter';
import DocumentsHeaderFilter from 'components/operators-detail/documentation/documents-header-filter';

function OperatorsDetailDocumentation({
  operatorDocumentation,
  operatorsDetail,
  fmus,
  setFMU,
  setDate
}) {
  const intl = useIntl();
  const user = useUser();
  const operator = operatorsDetail.data;
  const contractSigned = operator?.approved;
  const timeline = operatorsDetail.timeline.data;
  const canShowTimeline = contractSigned || user.canManageOperator(operator.id);
  const docsGroupedByCategory = HELPERS_DOC.getGroupedByCategory(
    operatorDocumentation
  );
  // Maximum amount of documents in a category, other bars will be proportional to it
  const maxDocs = Object.values(docsGroupedByCategory)
    .map((categoryDocs) => categoryDocs.length)
    .sort((a, b) => a - b)
    .reverse()[0];

  const filteredData = (operatorDocumentation || []).filter((d) => d.status !== 'doc_not_required');
  const groupedByStatusChart = HELPERS_DOC.getGroupedByStatusChart(filteredData);
  const validDocs = groupedByStatusChart.find((status) => status.id === 'doc_valid');
  const [searchText, setSearchText] = useState('');

  const router = useRouter();
  useEffect(() => {
    setFMU(fmus.find(f => f.id === router.query.fmuId));
  }, [router.query.fmuId, fmus])
  useEffect(() => {
    setDate(router.query.date || dayjs().format('YYYY-MM-DD'));
  }, [router.query.date])
  const onFmuChange = (fmuId) => {
    setUrlParam('fmuId', fmuId);
  };
  const onDateChange = (date) => {
    setUrlParam('date', dayjs(date).format('YYYY-MM-DD'));
  };

  return (
    <div>
      <div className="c-section">
        <div className="l-container">
          <DocumentsFilter showDate showFMU onDateChange={onDateChange} onFmuChange={onFmuChange} />
          <DocumentsHeaderFilter searchText={searchText} onSearchTextChange={setSearchText} onDateChange={onDateChange} onFmuChange={onFmuChange} />

          <DocumentsPublicationAuthorization id={operator.id} />

          <article className="c-article">
            <header>
              {/* X % valid documents available */}
              <h2 className="c-title">
                {intl.formatMessage(
                  {
                    id: 'operator-detail.documents.title',
                  },
                  {
                    percentage: validDocs
                      ? validDocs.value
                      : 0,
                  }
                )}
              </h2>
            </header>

            <div className="content c-documentation-pie-chart">
              {/* Pie chart */}
              <DocumentsProvidedChart
                data={groupedByStatusChart}
                operatorId={Number(operator.id)}
              />
              <div className="pie-categories">
                {Object.entries(docsGroupedByCategory).map(
                  ([category, docs]) => (
                    <DocumentStatusBar
                      key={category}
                      category={category}
                      docs={docs}
                      maxDocs={maxDocs}
                    />
                  )
                )}
              </div>
            </div>
          </article>

          {/* Timeline chart */}
          {canShowTimeline && timeline && timeline.length > 1 && (
            <DocumentsTimeline timelineData={timeline} />
          )}
        </div>
      </div>

      <div className="c-section">
        <div className="l-container">
          {/* Document sections with cards */}
          <DocumentsByOperator
            groupedByCategory={docsGroupedByCategory}
            searchText={searchText}
            id={operator.id}
          />
        </div>
      </div>
    </div >
  );
}

OperatorsDetailDocumentation.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorDocumentation: PropTypes.array
};

export default connect(
  (state) => ({
    fmus: getHistoricFMUs(state),
  }),
  {
    setDate: setOperatorDocumentationDate,
    setFMU: setOperatorDocumentationFMU
  }
)(OperatorsDetailDocumentation);
