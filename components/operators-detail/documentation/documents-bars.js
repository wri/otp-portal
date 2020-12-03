import sortBy from 'lodash/sortBy';
import { HELPERS_DOC } from 'utils/documentation';

export default function DocumentStatusBar({ category, className, docs }) {
  const groupedByStatus = HELPERS_DOC.getGroupedByStatus(docs);
  const validDocs =
    (groupedByStatus.doc_valid?.length || 0) +
    (groupedByStatus.doc_not_required?.length || 0);
  return (
    <div className={`c-doc-by-category${className ? ` ${className}` : ''}`}>
      <div className="doc-by-category-desc">
        <div className="doc-by-category-chart">
          <div className="doc-by-category-bar">
            {sortBy(Object.keys(groupedByStatus)).map((status) => {
              const segmentWidth = `${
                (groupedByStatus[status].length / docs.length) * 100
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
          <span>{`${
            groupedByStatus.doc_valid || groupedByStatus.doc_not_required
              ? ((validDocs / docs.length) * 100).toFixed(0)
              : 0
          }% valid`}</span>
        </div>
        <h3 className="c-title -proximanova -extrabig -uppercase">
          {category}
        </h3>
      </div>
    </div>
  );
}
