import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import dayjs from 'dayjs';
import * as Sentry from '@sentry/nextjs';

import { connect } from 'react-redux';

import { getOperatorDocumentationDate } from 'selectors/operators-detail/documentation';

// Intl
import { injectIntl } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import ConfirmModal from 'components/ui/confirm-modal';
import DocModal from 'components/ui/doc-modal';

class DocCardUpload extends React.Component {
  constructor(props) {
    super(props);

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerEditFile = this.triggerEditFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerNotRequiredFile = this.triggerNotRequiredFile.bind(this);

    // SERVICE
    this.documentationService = new DocumentationService({
      authorization: props.user.token,
    });
  }

  /**
   * UI EVENTS
   * - triggerAddFile
   * - triggerNotRequiredFile
   * - triggerEditFile
   * - triggerDeleteFile
   */
  triggerAddFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerNotRequiredFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        notRequired: true,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerEditFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        notRequired: !!this.props.reason,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { title, intl } = this.props;

    modal.toggleModal(true, {
      children: ConfirmModal,
      childrenProps: {
        title: intl.formatMessage({ id: 'delete.document.title', defaultMessage: 'Delete {document}?' }, { document: title }),
        text: intl.formatMessage(
          { id: 'delete.document.text', defaultMessage: 'Are you sure you want to delete document {document}?' }, { document: title }
        ),
        confirmText: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        onConfirm: this.triggerConfirmedDeleteFile.bind(this),
        onCancel: () => modal.toggleModal(false),
      },
      size: '-small'
    });
  }

  triggerConfirmedDeleteFile({ onSuccess, onError } = {}) {
    const { docId, intl } = this.props;

    this.documentationService.deleteDocument(docId)
      .then(() => {
        modal.toggleModal(false);
        onSuccess && onSuccess();
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        onError && onError(
          intl.formatMessage({ id: 'document.delete.error', defaultMessage: 'An error occurred while deleting the document.' })
        );
        Sentry.captureException(err);
        console.error(err);
      });
  }

  render() {
    const { status, buttons, date } = this.props;
    const currentDate = dayjs(new Date());
    const selectedDate = dayjs(date);
    const isEditable =
      currentDate.year() === selectedDate.year() &&
      currentDate.month() === selectedDate.month() &&
      currentDate.dayOfYear() === selectedDate.dayOfYear();
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
                  onClick={this.triggerEditFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'edit' })}
                </button>
              </li>
            )}

            {buttons.delete && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerDeleteFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'delete' })}
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
                  onClick={this.triggerAddFile}
                  className="c-button -small -secondary"
                >
                  {this.props.intl.formatMessage({ id: 'add-file' })}
                </button>
              </li>
            )}

            {buttons.not_required && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerNotRequiredFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'notrequired-file' })}
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
                  onClick={this.triggerDeleteFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'required-file' })}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
}

DocCardUpload.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  user: PropTypes.object,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  buttons: PropTypes.shape({}),
  date: PropTypes.string,
  intl: PropTypes.object.isRequired,
};

DocCardUpload.defaultProps = {
  buttons: {
    add: true,
    update: true,
    delete: true,
    not_required: true,
  },
};

export default injectIntl(
  connect(
    (state) => ({
      date: getOperatorDocumentationDate(state),
    }),
    {}
  )(DocCardUpload)
);
