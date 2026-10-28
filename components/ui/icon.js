import React, { useSyncExternalStore } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { ICONS } from './icons';

function Shape({ icon }) {
  return (
    <>
      <title>{icon.title}</title>
      {icon.paths.map((d) => <path key={d} d={d} />)}
    </>
  );
}

// false on the server and while hydrating, true afterwards
const subscribe = () => () => {};
const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

// Rendered once, in _app. Adds every shape to the document as a symbol once the page has hydrated,
// so they stay out of the server's HTML. Hidden by size, like a sprite, not with display: none.
export function IconSymbols() {
  if (!useHydrated()) return null;

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      {Object.keys(ICONS).map((name) => (
        <symbol key={name} id={name} viewBox={ICONS[name].viewBox}>
          <Shape icon={ICONS[name]} />
        </symbol>
      ))}
    </svg>
  );
}

// References a symbol from IconSymbols, so it shows up once the page has hydrated. `inline` draws
// the shape into the HTML instead: use it for icons that are visible in the first paint.
export default function Icon({ name, style, className, inline = false }) {
  const classNames = classnames({
    [className]: !!className
  });
  const shape = inline ? ICONS[name] : null;

  if (shape) {
    return (
      <svg className={`c-icon ${classNames}`} style={style} viewBox={shape.viewBox}>
        <Shape icon={shape} />
      </svg>
    );
  }

  return (
    <svg className={`c-icon ${classNames}`} style={style}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  inline: PropTypes.bool
};
