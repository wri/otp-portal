import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import { useIntl } from 'react-intl';

import Icon from 'components/ui/icon';

function AnnexTooltip({ annex, editable, onRemove, onEdit }) {
  const intl = useIntl();
  const formatDate = (date) => intl.formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div>
      <h4 className="c-title -default tooltip-title"><strong>{annex.name}</strong></h4>
      <dl className="tooltip-content">
        {editable && annex.status !== "doc_valid" && (
          <span className={`status-tag -${annex.status}`}>{intl.formatMessage({ id: 'annex_' + annex.status, defaultMessage: annex.status })}</span>
        )}
        {editable && annex.status === "doc_invalid" && annex['invalidation-reason'] && (
          <>
            <dt><strong>{intl.formatMessage({ id: 'annex.invalidation_reason' })}:</strong></dt>
            <dd>{annex['invalidation-reason']}</dd>
          </>
        )}
        <dt><strong>{intl.formatMessage({ id: 'annex.start_date' })}:</strong></dt>
        <dd>{annex['start-date'] ? formatDate(annex['start-date']) : '-'}</dd>
        <dt><strong>{intl.formatMessage({ id: 'annex.expiry_date' })}:</strong></dt>
        <dd>{annex['expire-date'] ? formatDate(annex['expire-date']) : '-'}</dd>
        <dt><strong>File:</strong></dt>
        <dd>
          {annex.attachment &&
            <a href={annex.attachment.url} target="_blank" className="c-button -small -tooltip">{intl.formatMessage({ id: 'Open file' })}</a>
          }
        </dd>
      </dl>
      {editable && (
        <div className="tooltip-footer">
          <button
            className="c-button -small -tooltip"
            type="button"
            data-test-id="remove-annex-button"
            onClick={() => onEdit && onEdit(annex)}
          >
            Edit
          </button>

          <button
            className="c-button -small -tooltip -tooltip-secondary"
            type="button"
            data-test-id="remove-annex-button"
            onClick={() => onRemove && onRemove(annex.id)}
          >
            <span className="tooltip-hidden-button-text">{intl.formatMessage({ id: 'annex.remove' })}</span>
            <Icon className="" name="icon-bin" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DocAnnex({ annex, editable, visible, onEdit, onRemove }) {
  return (
    <Tooltip
      placement="bottom"
      visible={visible}
      align={{
        offset: [0, 10],
      }}
      overlay={<AnnexTooltip annex={annex} editable={editable} onEdit={onEdit} onRemove={onRemove} />}
      overlayClassName="c-tooltip annex-tooltip fixed-width"
    >
      <button
        className="c-button"
        type="button"
      >
        <Icon className="" name="icon-file-empty" />
      </button>
    </Tooltip>
  )
}

DocAnnex.defaultProps = {
  editable: false
}

DocAnnex.propTypes = {
  annex: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  onRemove: PropTypes.func,
  onEdit: PropTypes.func
}
