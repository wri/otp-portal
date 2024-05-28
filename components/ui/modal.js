import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';

// Components
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

// Actions
import * as actions from 'modules/modal';

// Services
import { EE } from 'services/modal';

class Modal extends React.Component {

  onToogleModal = (e) => {
    const { toggleModal } = this.props;
    if (toggleModal) toggleModal(e.detail.opened, e.detail.opts);
  }

  onSetModalOptions = (e) => {
    const { setModalOptions } = this.props;
    if (setModalOptions) setModalOptions(e.detail.opts);
  }

  componentDidMount() {
    const { setModalOptions } = this.props;

    EE.addEventListener('toggleModal', this.onToogleModal);
    EE.addEventListener('setModalOptions', this.onSetModalOptions);

    this.el.addEventListener('transitionend', () => {
      if (!this.props.modal.opened) {
        setModalOptions({ children: null });
      }
    });
  }

  componentDidUpdate({ modal }) {
    function escKeyDownListener(e) {
      document.removeEventListener('keydown', escKeyDownListener);
      return e.keyCode === 27 && this.props.toggleModal(false);
    }

    // if opened property has changed
    if (this.props.modal.opened !== modal.opened) {
      document[this.props.modal.opened ? 'addEventListener' : 'removeEventListener']('keydown', escKeyDownListener.bind(this));
    }
  }

  componentWillUnmount() {
    EE.removeEventListener('toggleModal', this.onToogleModal);
    EE.removeEventListener('setModalOptions', this.onSetModalOptions);
  }

  getContent() {
    return this.props.modal.options.children ?
      <this.props.modal.options.children {...this.props.modal.options.childrenProps} /> : null;
  }

  render() {
    const { opened, options, loading } = this.props.modal;

    const classNames = classnames({
      '-hidden': !opened,
      [options.size]: !!options.size
    });

    return (
      <section
        ref={(node) => { this.el = node; }}
        className={`c-modal ${classNames}`}
      >
        {(loading || this.props.modal.options.children) && (
          <>
            <div className="modal-container">
              <button
                className="modal-close"
                onClick={() => this.props.toggleModal(false)}
              >
                <Icon name="icon-cross" className="-big" />
              </button>
              <div className="modal-content">
                {loading ? <Spinner isLoading /> : this.getContent()}
              </div>
            </div>

            <area
              className="modal-backdrop"
              onClick={() => this.props.toggleModal(false)}
            />
          </>
        )}
      </section>
    );
  }
}

Modal.propTypes = {
  // STORE
  modal: PropTypes.object,

  // ACTIONS
  toggleModal: PropTypes.func,
  setModalOptions: PropTypes.func
};

export default connect(
  state => ({
    modal: state.modal ? state.modal : state.get('modal')
  }),
  actions
)(Modal);
