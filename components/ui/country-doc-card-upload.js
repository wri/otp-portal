import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { useIntl } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import CountryDocModal from 'components/ui/country-doc-modal';
import Spinner from 'components/ui/spinner';

const CountryDocCardUpload = (props) => {
  const { status, docType, user, id, onChange } = props;
  const intl = useIntl();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const triggerAddFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: CountryDocModal,
      childrenProps: {
        ...props,
        onChange: () => {
          onChange && onChange();
        }
      }
    });
  };

  const triggerDeleteFile = (e) => {
    e && e.preventDefault();

    setDeleteLoading(true);

    documentationService.deleteDocument(id, 'gov-documents')
      .then(() => {
        setDeleteLoading(false);
        onChange && onChange();
      })
      .catch((err) => {
        setDeleteLoading(false);
        console.error(err);
      });
  };

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card-upload ${classNames}`}>
      {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending' || status === 'doc_expired') &&
        <ul>
          <li>
            <button onClick={triggerAddFile} className="c-button -small -primary">
              {intl.formatMessage({ id: `update-${docType}` })}
            </button>
          </li>

          <li>
            <button onClick={triggerDeleteFile} className="c-button -small -primary">
              {intl.formatMessage({ id: 'delete' })}
              <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
            </button>
          </li>
        </ul>
      }
      {status === 'doc_not_provided' &&
        <ul>
          <li>
            <button onClick={triggerAddFile} className="c-button -small -secondary">
              {intl.formatMessage({ id: `add-${docType}` })}
            </button>
          </li>
        </ul>
      }
    </div>
  );
};

CountryDocCardUpload.propTypes = {
  status: PropTypes.string,
  docType: PropTypes.string,
  user: PropTypes.object,
  id: PropTypes.string,
  onChange: PropTypes.func
};

export default CountryDocCardUpload;
