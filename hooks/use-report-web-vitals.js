import { useEffect } from 'react'
import {
  onLCP,
  onFID,
  onCLS,
  onINP,
  onFCP,
  onTTFB
} from 'next/dist/compiled/web-vitals'

// taken from newer nextjs version as 12 does not have it
export default function useReportWebVitals(reportWebVitalsFn) {
  useEffect(() => {
    onCLS(reportWebVitalsFn)
    onFID(reportWebVitalsFn)
    onLCP(reportWebVitalsFn)
    onINP(reportWebVitalsFn)
    onFCP(reportWebVitalsFn)
    onTTFB(reportWebVitalsFn)
  }, [reportWebVitalsFn])
}
