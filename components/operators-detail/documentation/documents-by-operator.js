import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import cx from 'classnames';

// Redux
import { connect } from 'react-redux';

import { getOperator, getOperatorDocumentation, getOperatorTimeline } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import DocumentStatusBar from 'components/operators-detail/documentation/documents-bars';
import DocumentsByFMU from './documents-by-fmu';

function DocumentsByOperator({ groupedByCategory, user, id, ...props }) {
  const [categoriesOpen, setCategoriesOpen] = useState(
    Object.keys(groupedByCategory).reduce(
      (acc, cat) => ({ ...acc, [cat]: false }),
      {}
    )
  );

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const producerDocs = groupedByCategory[category].filter(
          (doc) => doc.type === 'operator-document-country-histories'
        );
        const FMUDocs = groupedByCategory[category].filter(
          (doc) => doc.type === 'operator-document-fmu-histories'
        );
        const FMUDocsByFMU = groupBy(FMUDocs, 'fmu.id');
        const isCategoryOpen = categoriesOpen[category];

        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <header className="doc-gallery-item-header">
              <DocumentStatusBar
                category={category}
                docs={groupedByCategory[category]}
              />
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
                        onChange={() => {
                          props.getOperator(id)
                          props.getOperatorDocumentation(id)
                          props.getOperatorTimeline(id)
                        }}
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
  id: PropTypes.string,
  user: PropTypes.object,
};

export default connect(
  (state) => ({
    user: state.user,
  }),
  { getOperator, getOperatorDocumentation, getOperatorTimeline }
)(DocumentsByOperator);
