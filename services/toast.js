// Toasts live at module level, not in a component: Layout remounts on every page,
// and a toast fired just before navigating has to survive that.
let toasts = [];
let nextId = 0;
const listeners = new Set();
const EMPTY = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function add(type, title, message) {
  if (toasts.some((t) => t.type === type && t.title === title && t.message === message)) return;
  toasts = [{ id: ++nextId, type, title, message }, ...toasts];
  emit();
}

export function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getToasts = () => toasts;
export const getServerToasts = () => EMPTY;

const toast = {
  success: (title, message) => add('success', title, message),
  info: (title, message) => add('info', title, message),
  error: (title, message) => add('error', title, message),
};

export default toast;
