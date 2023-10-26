import React from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import Tooltip from 'rc-tooltip';
import { useIntl } from 'react-intl';

import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

export default function DocAnnex({ annex, isRemoving, showRemoveButton, onRemove }) {
  const intl = useIntl();

  return (
    <Tooltip
      placement="bottom"
      overlay={
        <div>
          <Spinner isLoading={isRemoving} className="-tiny -transparent" />
          <h4 className="c-title -default tooltip-title">{annex.name}</h4>
          <dl className="tooltip-content">
            <dt><strong>{intl.formatMessage({ id: 'annex.start_date' })}:</strong></dt>
            <dd>{annex['start-date'] ? annex['start-date'] : '-'}</dd>
            <dt><strong>{intl.formatMessage({ id: 'annex.expiry_date' })}:</strong></dt>
            <dd>{annex['expire-date'] ? annex['expire-date'] : '-'}</dd>
          </dl>
          <div className="tooltip-footer">
            {annex.attachment &&
              <a href={annex.attachment.url} target="_blank" rel="noopener noreferrer" className="c-button -small -tooltip">{intl.formatMessage({ id: 'file' })}</a>
            }
            {showRemoveButton &&
              <button
                className="c-button -small -tooltip -tooltip-secondary"
                type="button"
                data-test-id="remove-annex-button"
                onClick={() => onRemove && onRemove(annex.id)}
              >
                <span className="tooltip-hidden-button-text">{intl.formatMessage({ id: 'annex.remove' })}</span>
                <Icon className="" name="icon-bin" />
              </button>
            }
          </div>
        </div>
      }
      overlayClassName="c-tooltip"
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
  showRemoveButton: false
}

DocAnnex.propTypes = {
  annex: PropTypes.object.isRequired,
  showRemoveButton: PropTypes.bool,
  isRemoving: PropTypes.bool,
  onRemove: PropTypes.func
}
