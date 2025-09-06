import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import { useIntl } from 'react-intl';
import Fuse from 'fuse.js';

import { groupBy } from 'utils/general';

// Redux
import { connect } from 'react-redux';

import { getOperator, getOperatorDocumentation, getOperatorPublicationAuthorization, getOperatorTimeline } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import DocumentStatusBar from 'components/operators-detail/documentation/documents-bars';
import DocumentsByFMU from './documents-by-fmu';
import ExpandableSection from 'components/ui/expandable-section';
import useUser from 'hooks/use-user';

function DocumentsByOperator({ groupedByCategory, searchText, id, ...props }) {
  const intl = useIntl();
  const user = useUser();

  // Maximum amount of documents in a category, other bars will be proportional to it
  const maxDocs = Object.values(groupedByCategory)
    .map((categoryDocs) => categoryDocs.length)
    .sort((a, b) => a - b)
    .reverse()[0];

  const removeDiacritics = str => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  const searchDocuments = (documents) => {
    if (!searchText) return documents;

    const exactSearch = (doc) => removeDiacritics(doc.title.toLowerCase()).includes(removeDiacritics(searchText.toLowerCase()));
    const fuse = new Fuse(documents, {
      keys: ['title'],
      threshold: 0.4,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true
    });

    const exactSearchResults = searchText.length > 2 ? documents.filter(exactSearch) : [];
    const fuseSearchResults = fuse.search(searchText).map(r => r.item);
    return [...new Set([...exactSearchResults, ...fuseSearchResults])];
  }

  const results = Object.keys(groupedByCategory).map((category) => {
    const producerDocs = searchDocuments(groupedByCategory[category].filter(
      (doc) => doc.type === 'operator-document-country-histories'
    ));
    const FMUDocs = searchDocuments(groupedByCategory[category].filter(
      (doc) => doc.type === 'operator-document-fmu-histories'
    ));
    const FMUDocsByFMU = groupBy(sortBy(FMUDocs, 'fmu.name'), (d) => d.fmu?.name);

    return {
      category,
      hide: searchText?.length > 0 && producerDocs.length === 0 && FMUDocs.length === 0,
      producerDocs,
      FMUDocs,
      FMUDocsByFMU,
    };
  });
  const hasResults = results.filter(r => !r.hide).length > 0;

  return (
    <ul className="c-doc-gallery">
      {!hasResults && (
        <li className="doc-gallery-item no-results c-title -big">
          {intl.formatMessage({
            id: 'operator-detail.documents.search.no-results',
            defaultMessage: 'Cannot find any document matching your search text "{searchText}"'
          }, { searchText })}
        </li>
      )}
      {results.filter(r => !r.hide).map(({ category, producerDocs, FMUDocs, FMUDocsByFMU }) => {
        return (
          <ExpandableSection
            key={category}
            className="doc-gallery-item -top-border c-doc-by-category"
            defaultOpen={searchText?.length > 0}
            disabled={searchText?.length > 0}
            header={
              <DocumentStatusBar
                category={category}
                docs={groupedByCategory[category]}
                maxDocs={maxDocs}
              />
            }
          >
            {producerDocs.length > 0 && (
              <div className="doc-gallery-producer-docs">
                <h3>{intl.formatMessage({ id: 'operator-documents' })}:</h3>

                <div className="row l-row -equal-heigth">
                  {sortBy(producerDocs, ['position', 'title']).map((card) => (
                    <div key={card.id} className="columns small-12 medium-4">
                      <DocCard
                        {...card}
                        properties={{
                          type: 'operator',
                          id,
                        }}
                        onChange={() => {
                          props.getOperator(id)
                          props.getOperatorDocumentation(id)
                          props.getOperatorTimeline(id)
                        }}
                      />

                      {user.canManageOperator(id) && (
                        <DocCardUpload
                          {...card}
                          properties={{
                            type: 'operator',
                            id,
                          }}
                          onChange={() => {
                            props.getOperator(id)
                            props.getOperatorDocumentation(id)
                            props.getOperatorTimeline(id)
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {FMUDocs.length > 0 && (
              <DocumentsByFMU
                documents={FMUDocsByFMU}
                id={id}
                getOperator={(_id) => {
                  props.getOperator(_id)
                  props.getOperatorDocumentation(id)
                  props.getOperatorTimeline(id)
                }}
              />
            )}
          </ExpandableSection>
        );
      })}
    </ul>
  );
}

DocumentsByOperator.defaultProps = {
  data: [],
};

DocumentsByOperator.propTypes = {
  groupedByCategory: PropTypes.object,
  searchText: PropTypes.string,
  id: PropTypes.string
};

export default connect(
  null,
  { getOperator, getOperatorDocumentation, getOperatorPublicationAuthorization, getOperatorTimeline }
)(DocumentsByOperator);
