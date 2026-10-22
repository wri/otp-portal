import { useEffect } from 'react'
import {
  onLCP,
  onCLS,
  onINP,
  onFCP,
  onTTFB
} from 'next/dist/compiled/web-vitals'

// Copy of next/web-vitals without its reportSoftNavs option, so GTM gets one value per page load.
// The import is Next's internal web-vitals build; 16.4 moved it to v5, which dropped onFID.
export default function useReportWebVitals(reportWebVitalsFn) {
  useEffect(() => {
    onCLS(reportWebVitalsFn)
    onLCP(reportWebVitalsFn)
    onINP(reportWebVitalsFn)
    onFCP(reportWebVitalsFn)
    onTTFB(reportWebVitalsFn)
  }, [reportWebVitalsFn])
}
