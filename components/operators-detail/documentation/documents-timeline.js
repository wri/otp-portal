import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classnames from 'classnames';

import useHydrated from 'hooks/use-hydrated';

// Utils
import { STATUSES } from 'utils/documentation';
import { groupBy } from 'utils/general';
import { nearestIndex } from 'utils/charts';

// viewBox is W x 100, so y values are percentages
const W = 1000;

function buildPoints(timelineData) {
  return timelineData
    .map((docsByDate) => {
      const d = new Date(docsByDate.date);
      const { doc_not_required: notRequired = 0, ...summary } = docsByDate.summary;
      const required = docsByDate.total - notRequired;
      const bands = {};
      let buffer = 0;

      Object.keys(summary).forEach((k) => {
        const percentage = required ? (summary[k] / required) * 100 : 0;
        bands[k] = [buffer, buffer + percentage, percentage];
        buffer += percentage;
      });

      return {
        time: d.getTime() + (d.getTimezoneOffset() * 60000),
        year: d.getFullYear(),
        bands
      };
    })
    .reverse();
}

function bandPath(points, key, x) {
  const edge = (i, v) => `${Math.round(x(points[i].time) * W * 10) / 10},${Math.round((100 - v) * 100) / 100}`;
  const top = points.map((p, i) => edge(i, p.bands[key][1]));
  const bottom = points.map((p, i) => edge(i, p.bands[key][0])).reverse();
  return `M${top.join('L')}L${bottom.join('L')}Z`;
}

function TimelineTooltip({ point, keys, side, x }) {
  const intl = useIntl();
  const valid = point.bands.doc_valid?.[2] || 0;

  return (
    <div className={classnames('c-custom-tooltip', `-${side}`)} style={{ '--x': `${x * 100}%` }}>
      <p className="date-label">
        {intl.formatDate(point.time, { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
      <p className="valid-count">
        {intl.formatMessage({ id: 'operator-detail.documents.title' }, { percentage: valid.toFixed(2) })}
      </p>
      <div className="tooltip-categories">
        {keys.filter((k) => point.bands[k][2]).map((k) => (
          <p key={k} className="tooltip-category">
            <svg height="10" width="10" aria-hidden="true">
              <circle cx="5" cy="5" r="5" fill={STATUSES[k].fill} />
            </svg>
            {point.bands[k][2].toFixed(2)}%{' '}
            {intl.formatMessage({ id: k })}
          </p>
        ))}
      </div>
    </div>
  );
}

TimelineTooltip.propTypes = {
  point: PropTypes.object.isRequired,
  keys: PropTypes.array.isRequired,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  x: PropTypes.number.isRequired
};

function DocumentsTimeline({ timelineData = [] }) {
  // Client-only: the band paths grow with the number of dates and would bloat the HTML.
  const mounted = useHydrated();
  const [activeIndex, setActiveIndex] = useState(null);

  const chart = useMemo(() => {
    const points = buildPoints(timelineData);
    if (!points.length) return null;

    const times = points.map((p) => p.time);
    const t0 = times[0];
    const span = times[times.length - 1] - t0;
    const x = (t) => (span ? (t - t0) / span : 0.5);
    const keys = Object.keys(points[0].bands).filter((k) => STATUSES[k]);

    const ticks = Object.values(groupBy(points, 'year')).map((yearPoints) => ({
      year: yearPoints[0].year,
      x: x((yearPoints[0].time + yearPoints[yearPoints.length - 1].time) / 2)
    }));

    return {
      points,
      times,
      t0,
      span,
      x,
      keys,
      ticks,
      paths: keys.map((k) => ({ key: k, d: bandPath(points, k, x) }))
    };
  }, [timelineData]);

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setActiveIndex(nearestIndex(chart.times, chart.t0 + frac * chart.span));
  };

  const active = chart && activeIndex !== null ? chart.points[activeIndex] : null;
  const activeX = active ? chart.x(active.time) : 0;

  return (
    <div className="c-timeline-chart">
      {mounted && chart && (
        <div
          className="c-timeline-chart__inner"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setActiveIndex(null)}
        >
          <div className="c-timeline-chart__plot">
            <svg viewBox={`0 0 ${W} 100`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
              {chart.paths.map(({ key, d }) => (
                <path
                  key={key}
                  d={d}
                  fill={STATUSES[key].fill}
                  stroke={STATUSES[key].stroke}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {active && (
              <>
                <span className="c-timeline-chart__cursor" style={{ left: `${activeX * 100}%` }} />
                {chart.keys.filter((k) => active.bands[k][2]).map((k) => (
                  <span
                    key={k}
                    className="c-timeline-chart__dot"
                    style={{
                      left: `${activeX * 100}%`,
                      top: `${100 - active.bands[k][1]}%`,
                      background: STATUSES[k].stroke
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <div className="c-timeline-chart__axis">
            {chart.ticks.map((t) => (
              <span
                key={t.year}
                className={classnames({ '-start': t.x < 0.02, '-end': t.x > 0.98 })}
                style={{ left: `${t.x * 100}%` }}
              >
                {t.year}
              </span>
            ))}
          </div>

          {active && (
            <TimelineTooltip
              point={active}
              keys={chart.keys}
              side={activeX > 0.5 ? 'left' : 'right'}
              x={activeX}
            />
          )}
        </div>
      )}
    </div>
  );
}

DocumentsTimeline.propTypes = {
  timelineData: PropTypes.array,
};

export default DocumentsTimeline;
