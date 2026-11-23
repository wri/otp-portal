// Phases are collected on the request object because _app and _document both
// contribute to one response; the header is written from _document, which is the
// last hook to run before the body is sent.
const ENABLED = process.env.SERVER_TIMING === 'true';

export function track(req, name) {
  if (!ENABLED || !req) return () => {};

  const start = process.hrtime.bigint();

  return () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (!req.__serverTiming) req.__serverTiming = [];
    req.__serverTiming.push(`${name};dur=${ms.toFixed(1)}`);
  };
}

export function sendServerTiming(req, res) {
  if (!ENABLED || !res || res.headersSent) return;
  if (!req || !req.__serverTiming || !req.__serverTiming.length) return;

  res.setHeader('Server-Timing', req.__serverTiming.join(', '));
}
