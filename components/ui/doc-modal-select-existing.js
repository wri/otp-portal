import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import Spinner from 'components/ui/spinner';
import { getReusableDocuments } from 'modules/document-reuse';
import {
  getReusableDocumentsGrouped,
  getReusableDocumentsLoading,
} from 'selectors/document-reuse';
import { removeDiacritics } from 'utils/general';

const STATUS_LABEL_ID = {
  doc_valid: 'doc_valid',
  doc_invalid: 'doc_invalid',
  doc_pending: 'doc_pending',
  doc_expired: 'doc_expired',
  doc_not_provided: 'doc_not_provided',
};

const ANNEX_STATUS_LABEL_ID = {
  doc_valid: 'doc_valid',
  doc_invalid: 'annex_doc_invalid',
  doc_pending: 'annex_doc_pending',
  doc_expired: 'annex_doc_expired',
};

const StatusBadge = ({ status, kind }) => {
  const intl = useIntl();
  if (!status) return null;
  const map = kind === 'annex' ? ANNEX_STATUS_LABEL_ID : STATUS_LABEL_ID;
  const id = map[status] || status;
  return (
    <span className={`c-doc-modal-select-existing__status-badge -${status}`}>
      {intl.formatMessage({ id })}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
  kind: PropTypes.oneOf(['document', 'annex']),
};

const normalize = (s) => removeDiacritics(s).toLowerCase();

const matches = (q, ...fields) =>
  fields.some((f) => normalize(f).includes(q));

const filterTree = (operators, query, excludeDocId) => {
  const q = normalize(query.trim());

  return operators
    .map((op) => {
      const categories = op.categories
        .map((cat) => {
          const documents = cat.documents
            .filter((doc) => String(doc.docId) !== String(excludeDocId))
            .map((doc) => {
              if (!q) return doc;

              const docMatches = matches(
                q,
                doc.title,
                doc.fmuName,
                cat.categoryName,
                op.operatorName
              );

              const matchingAnnexes = doc.annexes.filter((a) =>
                matches(q, a.name)
              );

              if (docMatches) return doc;
              if (matchingAnnexes.length) return { ...doc, annexes: matchingAnnexes };
              return null;
            })
            .filter(Boolean);

          if (!documents.length) return null;
          return { ...cat, documents };
        })
        .filter(Boolean);

      if (!categories.length) return null;
      return { ...op, categories };
    })
    .filter(Boolean);
};

const DocModalSelectExisting = ({
  operatorIds,
  excludeDocId,
  currentSelection,
  onSelect,
  search,
  onSearchChange,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const operators = useSelector(getReusableDocumentsGrouped);
  const loading = useSelector(getReusableDocumentsLoading);

  useEffect(() => {
    if (operatorIds && operatorIds.length) {
      dispatch(getReusableDocuments(operatorIds));
    }
  }, [dispatch, operatorIds]);

  const filtered = useMemo(
    () => filterTree(operators, search, excludeDocId),
    [operators, search, excludeDocId]
  );

  const isChecked = (kind, id) =>
    currentSelection &&
    currentSelection.kind === kind &&
    String(currentSelection.id) === String(id);

  const handleSelectDoc = (op, cat, doc) => {
    onSelect({
      kind: 'document',
      id: doc.docId,
      label: doc.title,
      url: doc.url,
      fmuName: doc.fmuName,
      operatorName: op.operatorName,
      categoryName: cat.categoryName,
    });
  };

  const handleSelectAnnex = (op, cat, doc, annex) => {
    onSelect({
      kind: 'annex',
      id: annex.id,
      label: annex.name,
      url: annex.url,
      fmuName: doc.fmuName,
      operatorName: op.operatorName,
      categoryName: cat.categoryName,
      parentTitle: doc.title,
    });
  };

  return (
    <div className="c-doc-modal-select-existing">
      <div className="c-doc-modal-select-existing__search c-field">
        <input
          type="text"
          className="c-doc-modal-select-existing__search-input"
          placeholder={intl.formatMessage({
            id: 'doc-modal.select-existing.search-placeholder',
          })}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="c-doc-modal-select-existing__list">
        {loading && !operators.length && (
          <div className="c-doc-modal-select-existing__loading">
            <Spinner className="-transparent -small" isLoading />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="c-doc-modal-select-existing__empty">
            {intl.formatMessage({ id: 'doc-modal.select-existing.empty' })}
          </div>
        )}

        {filtered.map((op) => (
          <div key={op.operatorId} className="c-doc-modal-select-existing__operator-group">
            {filtered.length > 1 && (
              <div className="c-doc-modal-select-existing__operator-header">
                {op.operatorName}
              </div>
            )}

            {op.categories.map((cat) => (
              <React.Fragment key={`${op.operatorId}-${cat.categoryName}`}>
                <div className="c-doc-modal-select-existing__category-header">
                  {cat.categoryName}
                </div>

                {cat.documents.map((doc) => {
                  const checked = isChecked('document', doc.docId);
                  return (
                    <React.Fragment key={`doc-${doc.docId}`}>
                      <label
                        className={classnames('c-doc-modal-select-existing__doc-row', {
                          '-selected': checked,
                        })}
                      >
                        <input
                          type="radio"
                          name="doc-modal-source"
                          checked={checked}
                          onChange={() => handleSelectDoc(op, cat, doc)}
                        />
                        <div className="c-doc-modal-select-existing__doc-main">
                          <span className="c-doc-modal-select-existing__doc-name">
                            {doc.title}
                          </span>
                          {doc.fmuName && (
                            <span className="c-doc-modal-select-existing__doc-meta">
                              {doc.fmuName}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={doc.status} kind="document" />
                      </label>

                      {doc.annexes.map((annex) => {
                        const annexChecked = isChecked('annex', annex.id);
                        return (
                          <label
                            key={`annex-${annex.id}`}
                            className={classnames('c-doc-modal-select-existing__annex-row', {
                              '-selected': annexChecked,
                            })}
                          >
                            <input
                              type="radio"
                              name="doc-modal-source"
                              checked={annexChecked}
                              onChange={() => handleSelectAnnex(op, cat, doc, annex)}
                            />
                            <span className="c-doc-modal-select-existing__annex-name">
                              {annex.name}
                            </span>
                            <StatusBadge status={annex.status} kind="annex" />
                          </label>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

DocModalSelectExisting.propTypes = {
  operatorIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  excludeDocId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentSelection: PropTypes.shape({
    kind: PropTypes.oneOf(['document', 'annex']),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onSelect: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default DocModalSelectExisting;
