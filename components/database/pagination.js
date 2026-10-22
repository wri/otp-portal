import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import Icon from 'components/ui/icon';

// 0-based page indexes; first and last always shown, a window of 3 around the current one
export function getPageItems(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);

  let start = Math.max(1, Math.min(page - 1, pages - 4));
  let end = Math.min(pages - 2, Math.max(page + 1, 3));
  // a gap hiding just one page would take as much room as that page
  if (start === 2) start = 1;
  if (end === pages - 3) end = pages - 2;
  const items = [0];

  if (start > 1) items.push('start-gap');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < pages - 2) items.push('end-gap');
  items.push(pages - 1);

  return items;
}

// react-table v6 PaginationComponent
export default function Pagination({ page, pages, canPrevious, canNext, onPageChange }) {
  const intl = useIntl();

  if (!pages || pages < 1) return null;

  return (
    <nav className="c-db-pagination" aria-label={intl.formatMessage({ id: 'pagination.label' })}>
      <p className="c-db-pagination__summary">
        {intl.formatMessage({ id: 'database.page_of' }, { page: page + 1, pages })}
      </p>
      <div className="c-db-pagination__pages">
        <button
          type="button"
          className="c-db-pagination__btn -arrow"
          disabled={!canPrevious}
          onClick={() => onPageChange(page - 1)}
          aria-label={intl.formatMessage({ id: 'pagination.previous' })}
        >
          <Icon name="icon-arrow-left" />
        </button>
        {getPageItems(page, pages).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={`c-db-pagination__btn${item === page ? ' -current' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => item !== page && onPageChange(item)}
            >
              {item + 1}
            </button>
          ) : (
            <span key={item} className="c-db-pagination__gap" aria-hidden="true">…</span>
          )
        ))}
        <button
          type="button"
          className="c-db-pagination__btn -arrow"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label={intl.formatMessage({ id: 'pagination.next' })}
        >
          <Icon name="icon-arrow-right" />
        </button>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  pages: PropTypes.number,
  canPrevious: PropTypes.bool,
  canNext: PropTypes.bool,
  onPageChange: PropTypes.func,
};
