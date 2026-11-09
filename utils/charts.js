const TAU = Math.PI * 2;

// Angles are radians clockwise from 12 o'clock, matching how the donuts are read.
export function polar(angle, radius) {
  return [radius * Math.sin(angle), -radius * Math.cos(angle)];
}

const round = (n) => Math.round(n * 100) / 100;
const point = (angle, radius) => polar(angle, radius).map(round).join(' ');

export function arcPath(start, end, outer, inner) {
  // An arc can't start and end on the same point, so a full ring is two halves.
  if (end - start >= TAU - 1e-6) {
    return [
      `M0 ${-outer}A${outer} ${outer} 0 1 1 0 ${outer}A${outer} ${outer} 0 1 1 0 ${-outer}Z`,
      `M0 ${-inner}A${inner} ${inner} 0 1 0 0 ${inner}A${inner} ${inner} 0 1 0 0 ${-inner}Z`
    ].join('');
  }

  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M${point(start, outer)}`,
    `A${outer} ${outer} 0 ${large} 1 ${point(end, outer)}`,
    `L${point(end, inner)}`,
    `A${inner} ${inner} 0 ${large} 0 ${point(start, inner)}`,
    'Z'
  ].join('');
}

export function pieSegments(data) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let angle = 0;

  return data.map((d) => {
    const start = angle;
    angle += total ? (d.value / total) * TAU : 0;
    return { ...d, start, end: angle, mid: (start + angle) / 2 };
  });
}

// Index of the value closest to `target` in an ascending array.
export function nearestIndex(values, target) {
  let lo = 0;
  let hi = values.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && target - values[lo - 1] <= values[lo] - target) return lo - 1;
  return lo;
}
