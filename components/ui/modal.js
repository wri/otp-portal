import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';

// Components
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

// Actions
import * as actions from 'modules/modal';

// Services
import { EE } from 'services/modal';

const Modal = () => {
  const elRef = useRef(null);
  const dispatch = useDispatch();
  const modal = useSelector(state => state.modal ? state.modal : state.get('modal'));

  const onToogleModal = useCallback((e) => {
    dispatch(actions.toggleModal(e.detail.opened, e.detail.opts));
  }, [dispatch]);

  const onSetModalOptions = useCallback((e) => {
    dispatch(actions.setModalOptions(e.detail.opts));
  }, [dispatch]);

  useEffect(() => {
    EE.addEventListener('toggleModal', onToogleModal);
    EE.addEventListener('setModalOptions', onSetModalOptions);

    const handleTransitionEnd = () => {
      if (!modal.opened) {
        dispatch(actions.setModalOptions({ children: null }));
      }
    };

    if (elRef.current) {
      elRef.current.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
      EE.removeEventListener('toggleModal', onToogleModal);
      EE.removeEventListener('setModalOptions', onSetModalOptions);
      if (elRef.current) {
        elRef.current.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [onToogleModal, onSetModalOptions, modal.opened, dispatch]);

  useEffect(() => {
    const escKeyDownListener = (e) => {
      if (e.keyCode === 27) {
        dispatch(actions.toggleModal(false));
        document.removeEventListener('keydown', escKeyDownListener);
      }
    };

    if (modal.opened) {
      document.addEventListener('keydown', escKeyDownListener);
    }

    return () => {
      document.removeEventListener('keydown', escKeyDownListener);
    };
  }, [modal.opened, dispatch]);

  const getContent = () => {
    return modal.options.children ?
      <modal.options.children {...modal.options.childrenProps} /> : null;
  };

  const { opened, options, loading } = modal;

  const classNames = classnames({
    '-hidden': !opened,
    [options.size]: !!options.size
  });

  return (
    <section
      ref={elRef}
      className={`c-modal ${classNames}`}
    >
      {(loading || modal.options.children) && (
        <>
          <div className="modal-container">
            <button
              className="modal-close"
              onClick={() => dispatch(actions.toggleModal(false))}
            >
              <Icon name="icon-cross" className="-big" />
            </button>
            <div className="modal-content">
              {loading ? <Spinner isLoading /> : getContent()}
            </div>
          </div>

          <area
            className="modal-backdrop"
            onClick={() => dispatch(actions.toggleModal(false))}
          />
        </>
      )}
    </section>
  );
};

Modal.propTypes = {};

export default Modal;
