import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import modal from 'services/modal';
import { COLUMN_GROUPS, DEFAULT_COLUMNS } from 'constants/documents-database';

const ALL_COLUMNS = COLUMN_GROUPS.flatMap((g) => g.columns);

export default function ColumnsModal({ selected, onApply }) {
  const intl = useIntl();
  // draft until Apply, so the table does not reflow on every click
  const [draft, setDraft] = useState(selected);

  const toggle = (column) => {
    setDraft((prev) => (
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    ));
  };

  const apply = () => {
    onApply(ALL_COLUMNS.filter((c) => draft.includes(c)));
    modal.toggleModal(false);
  };

  return (
    <div className="c-columns-modal">
      <header className="c-columns-modal__header">
        <h2 className="c-columns-modal__title">
          {intl.formatMessage({ id: 'database.customize_table' })}
        </h2>
        <p className="c-columns-modal__description">
          {intl.formatMessage({ id: 'database.columns_description' })}{' '}
          <strong>
            {intl.formatMessage(
              { id: 'database.columns_selected' },
              { count: draft.length, total: ALL_COLUMNS.length }
            )}
          </strong>
        </p>
      </header>

      <div className="c-columns-modal__body">
        {COLUMN_GROUPS.map((group) => (
          <fieldset key={group.id} className="c-columns-modal__group">
            <legend>{intl.formatMessage({ id: `database.columns_group.${group.id}` })}</legend>
            <div className="c-columns-modal__options">
              {group.columns.map((column) => {
                const checked = draft.includes(column);
                return (
                  <label
                    key={column}
                    className={`c-columns-modal__option${checked ? ' -checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      name="database-columns"
                      value={column}
                      checked={checked}
                      onChange={() => toggle(column)}
                    />
                    <span>{intl.formatMessage({ id: column })}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <footer className="c-columns-modal__footer">
        <div className="c-columns-modal__shortcuts">
          <button type="button" className="-link" onClick={() => setDraft(ALL_COLUMNS)}>
            {intl.formatMessage({ id: 'database.select_all' })}
          </button>
          <button type="button" className="-link" onClick={() => setDraft(DEFAULT_COLUMNS)}>
            {intl.formatMessage({ id: 'database.reset_to_default' })}
          </button>
        </div>
        <div className="c-columns-modal__actions">
          <button type="button" className="-outline" onClick={() => modal.toggleModal(false)}>
            {intl.formatMessage({ id: 'cancel' })}
          </button>
          <button type="button" className="-solid" onClick={apply} disabled={!draft.length}>
            {intl.formatMessage({ id: 'database.apply' })}
          </button>
        </div>
      </footer>
    </div>
  );
}

ColumnsModal.propTypes = {
  selected: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
};
