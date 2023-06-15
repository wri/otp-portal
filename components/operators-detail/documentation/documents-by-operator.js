import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import cx from 'classnames';
import { injectIntl } from 'react-intl';
import Fuse from 'fuse.js';

// Redux
import { connect } from 'react-redux';

import { getOperator, getOperatorDocumentation, getOperatorDocumentationCurrent, getOperatorTimeline } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import DocumentStatusBar from 'components/operators-detail/documentation/documents-bars';
import DocumentsByFMU from './documents-by-fmu';

function DocumentsByOperator({ groupedByCategory, searchText, user, id, intl, ...props }) {
  // Maximum amount of documents in a category, other bars will be proportional to it
  const maxDocs = Object.values(groupedByCategory)
    .map((categoryDocs) => categoryDocs.length)
    .sort((a, b) => a - b)
    .reverse()[0];

  const [categoriesOpen, setCategoriesOpen] = useState(
    Object.keys(groupedByCategory).reduce(
      (acc, cat) => ({ ...acc, [cat]: false }),
      {}
    )
  );

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
      minMatchCharLength: 2,
      ignoreLocation: true,
      findAllMatches: true
    });

    const exactSearchResults = searchText.length > 2 ? documents.filter(exactSearch) : [];
    const fuseSearchResults = fuse.search(searchText);
    return uniq([...exactSearchResults, ...fuseSearchResults]);
  }

  const results = Object.keys(groupedByCategory).map((category) => {
    const producerDocs = searchDocuments(groupedByCategory[category].filter(
      (doc) => doc.type === 'operator-document-country-histories'
    ));
    const FMUDocs = searchDocuments(groupedByCategory[category].filter(
      (doc) => doc.type === 'operator-document-fmu-histories'
    ));
    const FMUDocsByFMU = groupBy(FMUDocs, 'fmu.id');
    const isCategoryOpen = categoriesOpen[category] || searchText?.length > 0;

    return {
      category,
      isCategoryOpen,
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
      {results.filter(r => !r.hide).map(({ category, isCategoryOpen, producerDocs, FMUDocs, FMUDocsByFMU }) => {
        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <header className="doc-gallery-item-header">
              <DocumentStatusBar
                category={category}
                docs={groupedByCategory[category]}
                maxDocs={maxDocs}
              />
              <button
                className={cx('doc-by-category-btn -proximanova', {
                  open: isCategoryOpen,
                  disabled: searchText?.length > 0
                })}
                onClick={() =>
                  setCategoriesOpen({
                    ...categoriesOpen,
                    [category]: !isCategoryOpen,
                  })
                }
              >
                {isCategoryOpen ? intl.formatMessage({ id: 'collapse' }) : intl.formatMessage({ id: 'expand' })}
              </button>
            </header>

            {producerDocs.length > 0 && isCategoryOpen && (
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

                      {((user && user.role === 'admin') ||
                        (user &&
                          (user.role === 'operator' || user.role === 'holding') &&
                          user.operator_ids &&
                          user.operator_ids.includes(+id))) && (
                          <DocCardUpload
                            {...card}
                            properties={{
                              type: 'operator',
                              id,
                            }}
                            user={user}
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

            {FMUDocs.length > 0 && isCategoryOpen && (
              <DocumentsByFMU
                documents={FMUDocsByFMU}
                user={user}
                id={id}
                getOperator={(_id) => {
                  props.getOperator(_id)
                  props.getOperatorDocumentation(id)
                  props.getOperatorTimeline(id)
                  props.getOperatorDocumentationCurrent(id);
                }}
              />
            )}
          </li>
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
  id: PropTypes.string,
  user: PropTypes.object,
  intl: PropTypes.object
};

export default injectIntl(connect(
  (state) => ({
    user: state.user,
  }),
  { getOperator, getOperatorDocumentation, getOperatorDocumentationCurrent, getOperatorTimeline }
)(DocumentsByOperator));
