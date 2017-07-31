import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Services
import DocumentsService from 'services/documentsService';
import modal from 'services/modal';

// Components
import DocModal from 'components/ui/doc-modal';

export default class DocCardUpload extends React.Component {

  constructor(props) {
    super(props);

    // STATE
    this.state = {
      deleteLoading: false
    };

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);

    // SERVICE
    this.documentsService = new DocumentsService({
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
      children: DocModal,
      childrenProps: {
        ...this.props
      }
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { documents } = this.props;
    const id = documents[0].id;


    this.documentsService.deleteDocument(id)
      .then(() => {
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render() {
    const { status } = this.props;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card-upload ${classNames}`}>
        {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending' || status === 'doc_expired') &&
          <ul>
            <li>
              <button onClick={this.triggerAddFile} className="c-button -primary">
                Update file
              </button>
            </li>

            <li>
              <button onClick={this.triggerDeleteFile} className="c-button -primary">
                Delete
              </button>
            </li>
          </ul>
        }
        {status === 'doc_not_provided' &&
          <ul>
            <li>
              <button onClick={this.triggerAddFile} className="c-button -secondary">
                Add file
              </button>
            </li>
          </ul>
        }

      </div>
    );
  }
}

DocCardUpload.propTypes = {
  status: PropTypes.string,
  user: PropTypes.object,
  documents: PropTypes.array,
  onChange: PropTypes.func
};
