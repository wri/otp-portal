import { useState, useEffect, useCallback } from 'react';
import { EE } from 'services/modal';

export const useModal = () => {
  const [modal, setModal] = useState({
    opened: false,
    options: {
      children: null,
      childrenProps: null,
      size: ''
    },
    loading: false
  });

  const toggleModal = useCallback((opened, opts = {}) => {
    setModal(prev => {
      const newState = { ...prev, opened };

      if (opened && opts && Object.keys(opts).length > 0) {
        newState.options = { ...opts };
      }

      return newState;
    });
  }, []);

  const setModalOptions = useCallback((opts = {}) => {
    setModal(prev => ({
      ...prev,
      options: { ...opts }
    }));
  }, []);

  const toggleModalLoading = useCallback((loading) => {
    setModal(prev => ({ ...prev, loading }));
  }, []);

  // Listen to events from the EventEmitter
  useEffect(() => {
    const handleToggleModal = (e) => {
      toggleModal(e.detail.opened, e.detail.opts);
    };

    const handleSetModalOptions = (e) => {
      setModalOptions(e.detail.opts);
    };

    EE.addEventListener('toggleModal', handleToggleModal);
    EE.addEventListener('setModalOptions', handleSetModalOptions);

    return () => {
      EE.removeEventListener('toggleModal', handleToggleModal);
      EE.removeEventListener('setModalOptions', handleSetModalOptions);
    };
  }, [toggleModal, setModalOptions]);

  return {
    modal,
    toggleModal,
    setModalOptions,
    toggleModalLoading
  };
};
