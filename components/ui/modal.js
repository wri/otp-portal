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

  componentDidMount() {
    const { toggleModal, setModalOptions } = this.props;

    EE.on('toggleModal', toggleModal);
    EE.on('setModalOptions', setModalOptions);

    this.el.addEventListener('transitionend', () => {
      if (!this.props.modal.opened) {
        setModalOptions({ children: null });
      }
    });
  }

  UNSAFE_componentWillReceiveProps({ modal }) {
    function escKeyDownListener(e) {
      document.removeEventListener('keydown', escKeyDownListener);
      return e.keyCode === 27 && this.props.toggleModal(false);
    }
    // if opened property has changed
    if (this.props.modal.opened !== modal.opened) {
      document[modal.opened ? 'addEventListener' : 'removeEventListener']('keydown', escKeyDownListener.bind(this));
    }
  }

  componentWillUnmount() {
    EE.removeListener('toggleModal');
    EE.removeListener('setModalOptions');
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
