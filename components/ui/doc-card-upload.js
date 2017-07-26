import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import DocumentsService from 'services/documentsService';


export default class DocCardUpload extends React.Component {

  constructor(props) {
    super(props);

    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerChangeFile = this.triggerChangeFile.bind(this);

    this.documentsService = new DocumentsService();
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

    this.documentsService.deleteDocument(id)
      .then(() => {
        console.info('DELETED FILE');
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  triggerChangeFile() {
    if (this.inputFile.files.length) {
      this.getBase64(this.inputFile.files[0])
        .then((result) => {
          const { id } = this.props;
          console.info(result);
          console.info('UPLOADING FILE');

          this.documentsService.saveDocument({
            id,
            type: 'PATCH',
            body: {
              attachment: result
            }
          })
            .then(() => {
              console.info('UPLOADED FILE');
              this.props.onChange && this.props.onChange();
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  render() {
    const { status } = this.props;

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
              </button>
            </li>

            <li>
              <button className="c-button -primary">
                Delete
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
  status: PropTypes.string,
  onChange: PropTypes.func
};
