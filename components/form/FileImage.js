import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

// Components
import Dropzone from 'react-dropzone';
import Icon from 'components/ui/icon';

import FormElement from './FormElement';

class FileImage extends FormElement {
  constructor(props) {
    super(props);

    const defaultValue = props.properties.default;
    const previewURL = `${process.env.BACKOFFICE_API_URL}/${defaultValue || ''}`;
    this.state = {
      value: (defaultValue) ?
        this.getBase64FromURL(previewURL) :
        '',
      accepted: (defaultValue) ?
        [{ name: defaultValue, preview: previewURL }] :
        [],
      rejected: [],
      dropzoneActive: false,
      loading: false
    };

    // BINDINGS
    this.triggerCancel = this.triggerCancel.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  /**
   * DROPZONE EVENTS
   * - onDragEnter
   * - onDragLeave
   * - onDrop
  */
  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(accepted, rejected) {
    this.setState({
      accepted: accepted.map(f => ({
        ...f,
        preview: URL.createObjectURL(f)
      })),
      rejected,
      dropzoneActive: false
    }, () => {
      if (accepted.length) {
        this.getBase64(accepted[0]);
      }
    });
  }

  /**
   * - getBase64
   * - getFileFromUrl
  */
  getBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.setState({
        value: reader.result
      }, () => {
        // Publish the new value to the form
        if (this.props.onChange) this.props.onChange(this.state.value);
        // Trigger validation
        this.triggerValidate();
      });
    };
    reader.onerror = (error) => {
      this.setState({
        value: '',
        error
      }, () => {
        // Publish the new value to the form
        if (this.props.onChange) this.props.onChange(this.state.value);
        // Trigger validation
        this.triggerValidate();
      });
    };
  }

  getBase64FromURL(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      this.getBase64(xhr.response);
    };
    xhr.send();
  }

  /**
   * UI EVENTS
   * - triggerBrowseOrCancel
   * - triggerChange
  */
  triggerCancel(event) {
    event.stopPropagation();
    const { accepted } = this.state;
    if (accepted.length) {
      this.setState({
        accepted: [],
        rejected: [],
        value: ''
      }, () => {
        // Publish the new value to the form
        if (this.props.onChange) this.props.onChange(this.state.value);
        // Trigger validation
        this.triggerValidate();
      });
    }
  }

  triggerChange(e) {
    this.setState({
      value: e.currentTarget.value
    }, () => {
      // Publish the new value to the form
      if (this.props.onChange) this.props.onChange(this.state.value);
      // Trigger validation
      this.triggerValidate();
    });
  }

  /**
   * HELPERS
   * - getFileImageName
   * - uploadFileImage
  */
  getFileImageName() {
    const { accepted } = this.state;

    if (accepted.length) {
      const current = accepted[0];
      return current.name;
    }

    return 'Select file to upload';
  }

  render() {
    const { properties } = this.props;
    const { accepted, rejected } = this.state;

    return (
      <div className="c-file-image">
        <Dropzone
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"]
          }}
          multiple={false}
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: 'file-dropzone' })}>
              <input {...getInputProps()} />

              {!accepted.length &&
                <div className="file-placeholder">
                  {properties.placeholder}
                  <Icon name="icon-plus" className="-big" />
                </div>
              }

              {!!accepted.length && accepted[0].preview &&
                <div className="file-preview">
                  <img className="file-image" src={accepted[0].preview} alt={accepted[0].name} />
                  <button onClick={this.triggerCancel} className="file-button c-button">
                    <Icon name="icon-cross" className="-small" />
                  </button>
                </div>
              }

              {!accepted.length && !!rejected.length && (
                <div className="file-rejected">
                  {rejected.map((file, i) => (
                    <div key={i}>
                      {file.file.name}: {file.errors.map(e => e.message).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    );
  }
}

FileImage.propTypes = {
  properties: PropTypes.object.isRequired,
  validations: PropTypes.array,
  onChange: PropTypes.func
};

export default injectIntl(FileImage, { withRef: true });
