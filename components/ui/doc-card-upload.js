import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Services
import DocumentsService from 'services/documentsService';

// Components
import Spinner from 'components/ui/spinner';

export default class DocCardUpload extends React.Component {

  constructor(props) {
    super(props);

    // STATE
    this.state = {
      uploadLoading: false,
      deleteLoading: false
    };

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerChangeFile = this.triggerChangeFile.bind(this);

    // SERVICE
    this.documentsService = new DocumentsService({
      authorization: props.user.token
    });
  }

  /**
   * HELPERS
   * - getBase64
   * @param  {[type]} file [File]
   * @return {[type]} bs64 [String]
  */
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
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
    this.inputFile.click();
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { id } = this.props;

    this.setState({ deleteLoading: true });

    this.documentsService.deleteDocument(id)
      .then(() => {
        this.setState({ deleteLoading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        console.error(err);
        this.setState({ deleteLoading: false });
      });
  }

  triggerChangeFile() {
    if (this.inputFile.files.length) {
      this.setState({ uploadLoading: true });

      this.getBase64(this.inputFile.files[0])
        .then((result) => {
          const { id, title } = this.props;

          this.documentsService.saveDocument({
            type: 'POST',
            body: {
              data: {
                type: 'documents',
                attributes: {
                  name: title,
                  'document-type': 'Report',
                  attachment: result
                },
                relationships: {
                  attacheable: {
                    data: {
                      type: 'operator-documents',
                      id
                    }
                  }
                }
              }
            }
          })
            .then(() => {
              this.setState({ uploadLoading: false });
              this.props.onChange && this.props.onChange();
            })
            .catch((err) => {
              console.error(err);
              this.setState({ uploadLoading: false });
            });
        })
        .catch((err) => {
          console.error(err);
          this.setState({ uploadLoading: false });
        });
    }
  }

  render() {
    const { status } = this.props;
    const { uploadLoading, deleteLoading } = this.state;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card-upload ${classNames}`}>
        {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending') &&
          <ul>
            <li>
              <input ref={(c) => { this.inputFile = c; }} type="file" onChange={this.triggerChangeFile} />
              <button onClick={this.triggerAddFile} className="c-button -primary">
                Update file
                <Spinner isLoading={uploadLoading} className="-tiny -transparent" />
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
              <input ref={(c) => { this.inputFile = c; }} type="file" onChange={this.triggerChangeFile} />
              <button onClick={this.triggerAddFile} className="c-button -secondary">
                Add file
                <Spinner isLoading={uploadLoading} className="-tiny -transparent" />
              </button>
            </li>
          </ul>
        }

      </div>
    );
  }
}

DocCardUpload.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.string,
  user: PropTypes.object,
  onChange: PropTypes.func
};
