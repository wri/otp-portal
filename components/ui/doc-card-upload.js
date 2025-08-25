import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import dayjs from 'dayjs';
import * as Sentry from '@sentry/nextjs';

import { connect } from 'react-redux';

import { getOperatorDocumentationDate } from 'selectors/operators-detail/documentation';

// Intl
import { useIntl } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import ConfirmModal from 'components/ui/confirm-modal';
import DocModal from 'components/ui/doc-modal';

const DocCardUpload = (props) => {
  const { status, buttons, date, user, title, docId, onChange, reason } = props;
  const intl = useIntl();
  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token,
  }), [user.token]);

  const triggerAddFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...props,
        onChange: () => {
          onChange && onChange();
        },
      },
    });
  };

  const triggerNotRequiredFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...props,
        notRequired: true,
        onChange: () => {
          onChange && onChange();
        },
      },
    });
  };

  const triggerEditFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...props,
        notRequired: !!reason,
        onChange: () => {
          onChange && onChange();
        },
      },
    });
  };

  const triggerConfirmedDeleteFile = ({ onSuccess, onError } = {}) => {
    documentationService.deleteDocument(docId)
      .then(() => {
        modal.toggleModal(false);
        onSuccess && onSuccess();
        onChange && onChange();
      })
      .catch((err) => {
        onError && onError(
          intl.formatMessage({ id: 'document.delete.error', defaultMessage: 'An error occurred while deleting the document.' })
        );
        Sentry.captureException(err);
        console.error(err);
      });
  };

  const triggerDeleteFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: ConfirmModal,
      childrenProps: {
        title: intl.formatMessage({ id: 'delete.document.title', defaultMessage: 'Delete {document}?' }, { document: title }),
        text: intl.formatMessage(
          { id: 'delete.document.text', defaultMessage: 'Are you sure you want to delete document {document}?' }, { document: title }
        ),
        confirmText: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        onConfirm: triggerConfirmedDeleteFile,
        onCancel: () => modal.toggleModal(false),
      },
      size: '-small'
    });
  };

  const currentDate = dayjs(new Date());
  const selectedDate = dayjs(date);
  const isEditable = selectedDate.isSame(currentDate, 'day');
  const btnTooltip = !isEditable
    ? 'Please select the most recent date on the filters to edit any document'
    : null;

  const classNames = classnames({
    [`-${status}`]: !!status,
  });

  return (
    <div className={`c-doc-card-upload ${classNames}`}>
      {(status === 'doc_valid' ||
        status === 'doc_invalid' ||
        status === 'doc_pending' ||
        status === 'doc_expired') && (
        <ul>
          {buttons.update && (
            <li>
              <button
                title={btnTooltip}
                disabled={!isEditable}
                onClick={triggerEditFile}
                className="c-button -small -primary"
              >
                {intl.formatMessage({ id: 'edit' })}
              </button>
            </li>
          )}

          {buttons.delete && (
            <li>
              <button
                title={btnTooltip}
                disabled={!isEditable}
                onClick={triggerDeleteFile}
                className="c-button -small -primary"
              >
                {intl.formatMessage({ id: 'delete' })}
              </button>
            </li>
          )}
        </ul>
      )}
      {status === 'doc_not_provided' && (
        <ul>
          {buttons.add && (
            <li>
              <button
                title={btnTooltip}
                disabled={!isEditable}
                onClick={triggerAddFile}
                className="c-button -small -secondary"
              >
                {intl.formatMessage({ id: 'add-file' })}
              </button>
            </li>
          )}

          {buttons.not_required && (
            <li>
              <button
                title={btnTooltip}
                disabled={!isEditable}
                onClick={triggerNotRequiredFile}
                className="c-button -small -primary"
              >
                {intl.formatMessage({ id: 'notrequired-file' })}
              </button>
            </li>
          )}
        </ul>
      )}

      {status === 'doc_not_required' && (
        <ul>
          {buttons.not_required && (
            <li>
              <button
                title={btnTooltip}
                disabled={!isEditable}
                onClick={triggerDeleteFile}
                className="c-button -small -primary"
              >
                {intl.formatMessage({ id: 'required-file' })}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

DocCardUpload.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  user: PropTypes.object,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  buttons: PropTypes.shape({}),
  date: PropTypes.string,
  reason: PropTypes.string,
};

DocCardUpload.defaultProps = {
  buttons: {
    add: true,
    update: true,
    delete: true,
    not_required: true,
  },
};


DocCardUpload.defaultProps = {
  buttons: {
    add: true,
    update: true,
    delete: true,
    not_required: true,
  },
};

export default connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
  }),
  {}
)(DocCardUpload);
