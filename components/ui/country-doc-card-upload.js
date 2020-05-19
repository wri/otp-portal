import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import CountryDocModal from 'components/ui/country-doc-modal';
import Spinner from 'components/ui/spinner';

class CountryDocCardUpload extends React.Component {

  constructor(props) {
    super(props);

    // STATE
    this.state = {
      deleteLoading: false
    };

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerNotRequiredFile = this.triggerNotRequiredFile.bind(this);

    // SERVICE
    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
  }

  /**
   * UI EVENTS
   * - triggerAddFile
   * - triggerDeleteFile
   * - triggerChangeFile
  */
  triggerAddFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: CountryDocModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
    });
  }

  triggerNotRequiredFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: CountryDocModal,
      childrenProps: {
        ...this.props,
        notRequired: true,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { id } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteDocument(id, 'gov-documents')
      .then(() => {
        this.setState({ deleteLoading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        this.setState({ deleteLoading: false });
        console.error(err);
      });
  }

  render() {
    const { status, docType } = this.props;
    const { deleteLoading } = this.state;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card-upload ${classNames}`}>
        {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending' || status === 'doc_expired') &&
          <ul>
            <li>
              <button onClick={this.triggerAddFile} className="c-button -small -primary">
                {this.props.intl.formatMessage({ id: `update-${docType}` })}
              </button>
            </li>

            <li>
              <button onClick={this.triggerDeleteFile} className="c-button -small -primary">
                {this.props.intl.formatMessage({ id: 'delete' })}
                <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
              </button>
            </li>
          </ul>
        }
        {status === 'doc_not_provided' &&
          <ul>
            <li>
              <button onClick={this.triggerAddFile} className="c-button -small -secondary">
                {this.props.intl.formatMessage({ id: `add-${docType}` })}
              </button>
            </li>
            <li>
              <button onClick={this.triggerNotRequiredFile} className="c-button -small -primary">
                {this.props.intl.formatMessage({ id: 'notrequired-file' })}
              </button>
            </li>
          </ul>
        }

        {status === 'doc_not_required' &&
          <ul>
            <li>
              <button onClick={this.triggerDeleteFile} className="c-button -small -primary">
                {this.props.intl.formatMessage({ id: 'required-file' })}
              </button>
            </li>
          </ul>
        }
      </div>
    );
  }
}

CountryDocCardUpload.propTypes = {
  status: PropTypes.string,
  docType: PropTypes.string,
  user: PropTypes.object,
  id: PropTypes.string,
  onChange: PropTypes.func,
  intl: intlShape.isRequired
};

export default injectIntl(CountryDocCardUpload);
