import useReportWebVitals from "hooks/use-report-web-vitals";
import { logEvent } from "utils/analytics";

// The Server-Timing header (see services/server-timing.js) splits TTFB into its
// server-side phases. Reporting them next to the TTFB value is what makes a slow
// one actionable - it says whether the time went to the server or to the network.
// Empty whenever SERVER_TIMING is off, in which case no extra params are sent.
function getServerTimingParams() {
  try {
    const [navigation] = performance.getEntriesByType('navigation');
    if (!navigation || !navigation.serverTiming) return {};

    return navigation.serverTiming.reduce((params, { name, duration }) => ({
      ...params,
      [`srv_${name}`]: Math.round(duration)
    }), {});
  } catch (err) {
    return {};
  }
}

function sendToGTM({name, delta, value, id}) {
  logEvent('web_vitals', {
    cwv_metric: name,
    cwv_id: id,
    cwv_value: delta,
    cwv_metric_value: value,
    cwv_metric_delta: delta,
    // only on TTFB: the phases explain that metric and nothing else
    ...(name === 'TTFB' ? getServerTimingParams() : {})
  });
}

export function WebVitalsTracking() {
  useReportWebVitals(sendToGTM);

  return null;
}
