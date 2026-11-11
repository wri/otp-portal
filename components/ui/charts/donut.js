import React, { useId } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { arcPath, pieSegments, round } from 'utils/charts';

const R = 100;
// Labels sit just outside the ring.
const LABEL_RADIUS = 1.06;

function labelStyle(angle, fill) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const tx = Math.abs(sin) < 0.25 ? -50 : sin > 0 ? 0 : -100;
  const ty = round(-50 - 50 * cos);

  return {
    left: `${round(50 + 50 * LABEL_RADIUS * sin)}%`,
    top: `${round(50 - 50 * LABEL_RADIUS * cos)}%`,
    transform: `translate(${tx}%, ${ty}%)`,
    textAlign: tx === -50 ? 'center' : (tx === 0 ? 'left' : 'right'),
    color: fill
  };
}

function Donut({ data, innerRatio, animate = false, formatLabel, className, children }) {
  // useId returns ":r1:", which isn't safe inside url(#...)
  const maskId = `donut-${useId().replace(/:/g, '')}`;
  const inner = R * innerRatio;
  const segments = pieSegments(data).filter((s) => s.value > 0);

  return (
    <div className={classnames('c-donut', className, { '-animate': animate })}>
      <svg viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden="true" focusable="false">
        {animate && (
          <mask id={maskId}>
            <circle
              className="c-donut__sweep"
              r={(R + inner) / 2}
              fill="none"
              stroke="#fff"
              strokeWidth={R - inner + 4}
              pathLength="1"
              transform="rotate(-90)"
            />
          </mask>
        )}
        <g mask={animate ? `url(#${maskId})` : undefined}>
          {segments.map((s) => (
            <path
              key={s.name}
              d={arcPath(s.start, s.end, R, inner)}
              fill={s.fill}
              stroke={s.stroke || '#fff'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>

      {formatLabel && segments.map((s) => (
        <span key={s.name} className="c-donut__label" style={labelStyle(s.mid, s.fill)}>
          {formatLabel(s)}
        </span>
      ))}

      {children}
    </div>
  );
}

Donut.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    fill: PropTypes.string,
    stroke: PropTypes.string
  })).isRequired,
  innerRatio: PropTypes.number.isRequired,
  animate: PropTypes.bool,
  formatLabel: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

export default Donut;
