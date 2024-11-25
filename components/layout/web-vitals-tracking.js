import useReportWebVitals from "hooks/use-report-web-vitals";
import { logEvent } from "utils/analytics";

function sendToGTM({name, delta, value, id}) {
  logEvent('web_vitals', {
    cwv_metric: name,
    cwv_id: id,
    cwv_value: delta,
    cwv_metric_value: value,
    cwv_metric_delta: delta,
  });
}

export function WebVitalsTracking() {
  useReportWebVitals(sendToGTM);

  return null;
}
