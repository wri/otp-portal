import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { omit } from 'utils/general';

// Intl
import { injectIntl } from 'react-intl';

import Dropzone from 'react-dropzone';

// Components
import Spinner from 'components/ui/spinner';

import FormElement from './FormElement';

class File extends FormElement {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      accepted: [],
      rejected: [],
      dropzoneActive: false,
      loading: false
    };

    // BINDINGS
    this.triggerBrowse = this.triggerBrowse.bind(this);
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
    if (!accepted.length) return;

    this.setState({
      accepted,
      rejected,
      dropzoneActive: false,
      loading: true
    });

    // Reading the file is asynchronous, so keep the pending read around for
    // whenReady(): submitting before it resolves would send the form without
    // the file.
    this.pendingRead = this.getBase64(accepted[0])
      .then(value => new Promise((resolve) => {
        // The file was cancelled or replaced while it was being read
        if (this.state.accepted[0] !== accepted[0]) {
          resolve();
          return;
        }

        this.setState({
          value: {
            name: accepted[0].name,
            base64: value
          },
          loading: false
        }, () => {
          // Publish the new value to the form
          if (this.props.onChange) this.props.onChange(this.state.value);
          // Trigger validation
          this.triggerValidate();
          resolve();
        });
      }))
      .catch((error) => {
        console.error(error);
        this.setState({
          accepted: [],
          value: '',
          loading: false
        }, () => {
          if (this.props.onChange) this.props.onChange(this.state.value);
          this.triggerValidate();
        });
      });
  }

  /**
   * - whenReady
   * Resolves once the dropped file has been read and published to the form.
   * @return {Promise}
  */
  whenReady() {
    return this.pendingRead;
  }

  /**
   * UI EVENTS
   * - triggerBrowse
   * - triggerCancel
   * - triggerChange
  */

  triggerBrowse() {
    this.dropzone.open();
  }

  triggerCancel() {
    this.pendingRead = null;

    this.setState({
      accepted: [],
      value: '',
      loading: false
    }, () => {
      // Publish the new value to the form
      if (this.props.onChange) this.props.onChange(this.state.value);
      // Trigger validation
      this.triggerValidate();
    });
  }

  triggerChange(e) {
    this.setState({
      value: {
        ...this.state.value,
        name: e.currentTarget.value
      }
    }, () => {
      if (this.state.value.base64) {
        // Publish the new value to the form
        if (this.props.onChange) this.props.onChange(this.state.value);
        // Trigger validation
        this.triggerValidate();
      }
    });
  }

  /**
   * - getBase64
   * @param  {File} file
   * @return {String} bs64
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

  render() {
    const { properties } = this.props;
    const { accepted, loading } = this.state;

    const inputClassName = classnames({
      [properties.className]: !!properties.className
    });
    const changeableName = (properties.changeableName !== null && properties.changeableName !== undefined) ? properties.changeableName : false;
    const disableClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <div className="c-file">
        <Dropzone
          ref={(node) => { this.dropzone = node; }}
          multiple={false}
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ onClick: disableClick, className: 'file-dropzone' })}>
              <input {...getInputProps()} />
              <input
                {...omit(properties, 'authorization')}
                className={`input ${inputClassName}`}
                value={this.state.value?.name || ''}
                placeholder={this.props.intl.formatMessage({ id: 'select-file' })}
                readOnly={!changeableName}
                id={`input-${properties.name}`}
                onChange={this.triggerChange}
              />

              {accepted.length ? (
                <button
                  type="button"
                  className="c-button -primary -compressed file-button"
                  onClick={this.triggerCancel}
                >
                  <Spinner className="-light -small" isLoading={loading} />
                  {this.props.intl.formatMessage({ id: 'cancel' })}
                </button>
              ) : (
                <button
                  type="button"
                  className="c-button -primary -compressed file-button"
                  onClick={this.triggerBrowse}
                >
                  <Spinner className="-light -small" isLoading={loading} />
                  {this.props.intl.formatMessage({ id: 'browse-file' })}
                </button>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    );
  }
}

File.propTypes = {
  properties: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  intl: PropTypes.object.isRequired
};

export default injectIntl(File, { forwardRef: true });
