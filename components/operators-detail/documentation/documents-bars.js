import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import { HELPERS_DOC } from 'utils/documentation';

export default function DocumentStatusBar({ category, className, docs }) {
  const groupedByStatus = omit(
    HELPERS_DOC.getGroupedByStatus(docs),
    'doc_not_required'
  );
  const validDocs = groupedByStatus.doc_valid?.length || 0;
  const totalDocs = docs.filter((doc) => doc.status !== 'doc_not_required');

  return (
    <div className={`c-doc-by-category${className ? ` ${className}` : ''}`}>
      <div className="doc-by-category-desc">
        <div className="doc-by-category-chart">
          <div className="doc-by-category-bar">
            {sortBy(Object.keys(groupedByStatus)).map((status) => {
              const segmentWidth = `${
                (groupedByStatus[status].length / totalDocs.length) * 100
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
              ? ((validDocs / totalDocs.length) * 100).toFixed(0)
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
