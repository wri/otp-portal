import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import { removeToast } from 'services/toast';

const TIMEOUT = 5000;
// after the pointer leaves a toast it paused
const HOVER_TIMEOUT = 1000;

const ICONS = {
  success: <path d="M27 4l-15 15-7-7-5 5 12 12 20-20z" />,
  info: (
    <>
      <path d="M14 9.5c0-0.825 0.675-1.5 1.5-1.5h1c0.825 0 1.5 0.675 1.5 1.5v1c0 0.825-0.675 1.5-1.5 1.5h-1c-0.825 0-1.5-0.675-1.5-1.5v-1z" />
      <path d="M20 24h-8v-2h2v-6h-2v-2h6v8h2z" />
      <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13z" />
    </>
  ),
  error: <path d="M12,0C5.373,0,0,5.373,0,12s5.373,12,12,12s12-5.373,12-12S18.627,0,12,0z M12,19.66 c-0.938,0-1.58-0.723-1.58-1.66c0-0.964,0.669-1.66,1.58-1.66c0.963,0,1.58,0.696,1.58,1.66C13.58,18.938,12.963,19.66,12,19.66z M12.622,13.321c-0.239,0.815-0.992,0.829-1.243,0c-0.289-0.956-1.316-4.585-1.316-6.942c0-3.11,3.891-3.125,3.891,0 C13.953,8.75,12.871,12.473,12.622,13.321z" />
};

const ToastItem = ({ id, type, title, message }) => {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  const hideIn = (ms) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLeaving(true), ms);
  };

  useEffect(() => {
    hideIn(TIMEOUT);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <div
      className={cx('c-toast', `-${type}`, leaving ? '-leaving' : '-entering')}
      role="alertdialog"
      aria-labelledby={title ? `toast-title-${id}` : undefined}
      aria-describedby={message ? `toast-message-${id}` : undefined}
      onMouseEnter={() => clearTimeout(timer.current)}
      onMouseLeave={() => hideIn(HOVER_TIMEOUT)}
      onAnimationEnd={() => leaving && removeToast(id)}
    >
      <div className="toast-icon">
        <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">{ICONS[type]}</svg>
      </div>
      <div className="toast-content">
        {title && <div className="toast-title" id={`toast-title-${id}`}>{title}</div>}
        {message && <div className="toast-message" id={`toast-message-${id}`}>{message}</div>}
      </div>
      <button type="button" className="toast-close" aria-label="Close" onClick={() => setLeaving(true)}>
        <span>✕</span>
      </button>
    </div>
  );
};

const ToastList = ({ toasts }) => (
  <div className="c-toasts">
    {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
  </div>
);

export default ToastList;
