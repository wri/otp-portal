import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import DocModal from 'components/ui/doc-modal';
import Spinner from 'components/ui/spinner';

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
      children: DocModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { id, type } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteDocument(id)
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
    const { status } = this.props;
    const { deleteLoading } = this.state;

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
                <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
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
  type: PropTypes.string,
  status: PropTypes.string,
  user: PropTypes.object,
  id: PropTypes.string,
  onChange: PropTypes.func
};