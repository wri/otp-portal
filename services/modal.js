const emitter = new EventTarget();

const actions = {};
actions.toggleModal = (opened, opts = {}) => emitter.dispatchEvent(new CustomEvent('toggleModal', { detail: { opened, opts }}));
actions.setModalOptions = (opts = {}) => emitter.dispatchEvent(new CustomEvent('setModalOptions', { detail: { opts } }));

export const EE = emitter;
export default actions;
