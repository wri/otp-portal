import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import cx from 'classnames';

// Redux
import { connect } from 'react-redux';

import { getOperator } from 'modules/operators-detail';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import DocumentsByFMU from './documents-by-fmu';

function DocumentsByOperator({ data, user, id, ...props }) {
  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);
  const [categoriesOpen, setCategoriesOpen] = useState(
    Object.keys(groupedByCategory).reduce(
      (acc, cat) => ({ ...acc, [cat]: false }),
      {}
    )
  );

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const groupedByStatus = HELPERS_DOC.getGroupedByStatus(
          groupedByCategory[category]
        );
        const producerDocs = groupedByCategory[category].filter(
          (doc) => doc.type === 'operator-document-country-histories'
        );
        const FMUDocs = groupedByCategory[category].filter(
          (doc) => doc.type === 'operator-document-fmu-histories'
        );
        const FMUDocsByFMU = groupBy(FMUDocs, 'fmu.id');
        const isCategoryOpen = categoriesOpen[category];
        const validDocs =
          (groupedByStatus.doc_valid?.length || 0) +
          (groupedByStatus.doc_not_required?.length || 0);

        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <header className="doc-gallery-item-header">
              <div className="doc-by-category-desc">
                <div className="doc-by-category-chart">
                  {`${
                    groupedByStatus.doc_valid || groupedByStatus.doc_not_required
                      ? (
                          (validDocs / groupedByCategory[category].length) *
                          100
                        ).toFixed(0)
                      : 0
                  }%`}
                  <div className="doc-by-category-bar">
                    {sortBy(Object.keys(groupedByStatus)).map((status) => {
                      const segmentWidth = `${
                        (groupedByStatus[status].length /
                          groupedByCategory[category].length) *
                        100
                      }%`;
                      return (
                        <div
                          key={status}
                          className={`doc-by-category-bar-segment -${status}`}
                          style={{ width: segmentWidth }}
                        />
                      );
                    })}
                  </div>
                </div>
                <h3 className="c-title -proximanova -extrabig -uppercase">
                  {category}
                </h3>
              </div>
              <button
                className={cx('doc-by-category-btn -proximanova', {
                  open: isCategoryOpen,
                })}
                onClick={() =>
                  setCategoriesOpen({
                    ...categoriesOpen,
                    [category]: !isCategoryOpen,
                  })
                }
              >
                {isCategoryOpen ? 'Collapse' : 'Expand'}
              </button>
            </header>

            {producerDocs.length > 0 && isCategoryOpen && (
              <div className="doc-gallery-producer-docs">
                <h3>Producer Documents:</h3>
                <div className="row l-row -equal-heigth">
                  {sortBy(producerDocs, (doc) => doc.title).map((card) => (
                    <div key={card.id} className="columns small-12 medium-4">
                      <DocCard
                        {...card}
                        properties={{
                          type: 'operator',
                          id,
                        }}
                        onChange={() => props.getOperator(id)}
                      />

                      {((user && user.role === 'admin') ||
                        (user &&
                          user.role === 'operator' &&
                          user.operator_ids &&
                          user.operator_ids.includes(+id))) && (
                        <DocCardUpload
                          {...card}
                          properties={{
                            type: 'operator',
                            id,
                          }}
                          user={user}
                          onChange={() => props.getOperator(id)}
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
                getOperator={(_id) => props.getOperator(_id)}
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
  data: PropTypes.array,
  id: PropTypes.string,
  user: PropTypes.object,
};

export default connect(
  (state) => ({
    user: state.user,
  }),
  { getOperator }
)(DocumentsByOperator);
