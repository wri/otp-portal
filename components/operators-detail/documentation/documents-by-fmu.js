import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

function DocumentsByFMU({ documents, user, id, getOperator }) {
  const [FMUsOpen, setFMUsOpen] = useState(
    Object.values(documents)
      .map((d) => d[0].fmu.name)
      .reduce((acc, name) => ({ ...acc, [name]: true }), {})
  );
  return (
    <div className="c-doc-gallery-fmu-docs">
      <h3>FMU Documents:</h3>
      {Object.values(documents).map((docs) => {
        const FMUname = docs[0].fmu.name;
        const isFMUOpen = FMUsOpen[FMUname];
        const FMUByStatus = groupBy(docs, 'status');
        const validDocs =
          (docs.filter((d) => d.status === 'doc_valid').length +
            docs.filter((d) => d.status === 'doc_not_required').length) /
          docs.length;
        return (
          <div className="fmu-item" key={docs[0].fmu.name}>
            <div className="doc-gallery-item-header">
              <div className="doc-by-category-desc">
                <div className="doc-by-category-chart">
                  {`${(validDocs * 100).toFixed(0)}%`}
                  <div className="doc-by-category-bar">
                    {sortBy(Object.keys(FMUByStatus)).map((status) => {
                      const segmentWidth = `${
                        (FMUByStatus[status].length / docs.length) * 100
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
                <h4>{FMUname}</h4>
              </div>
              {/* <button
                className={cx('doc-by-category-btn -proximanova', { open: isFMUOpen })}
                onClick={() =>
                  setFMUsOpen({ ...FMUsOpen, [FMUname]: !isFMUOpen })}
              >
                {isFMUOpen ? 'Collapse' : 'Expand'}
              </button> */}
            </div>
            {isFMUOpen && (
              <div className="row l-row -equal-heigth">
                {sortBy(docs, (doc) => doc.title).map((card) => (
                  <div key={card.id} className="columns small-12 medium-4">
                    <DocCard
                      {...card}
                      properties={{
                        type: 'operator',
                        id,
                      }}
                      onChange={() => getOperator(id)}
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
                          onChange={() => getOperator(id)}
                        />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

DocumentsByFMU.propTypes = {
  documents: PropTypes.object,
  groupedByStatus: PropTypes.object,
  groupedByCategory: PropTypes.object,
  category: PropTypes.string,
  user: PropTypes.object,
  id: PropTypes.string,
  getOperator: PropTypes.func,
};

// export default connect(
//   state => ({
//     user: state.user
//   }),
//   null
// )(DocumentsByFMU);

export default DocumentsByFMU;
