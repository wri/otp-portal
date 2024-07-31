import * as Sentry from "@sentry/nextjs";

export function fetchIntegratedAlertsMetadata() {
  return fetch(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then(({ data }) => {
      const minDataDate = data.metadata.content_date_range.start_date;
      const maxDataDate = data.metadata.content_date_range.end_date;

      if (!minDataDate || !maxDataDate) {
        throw new Error('No min or max date found for integrated alerts layer');
      }

      return {
        minDataDate,
        maxDataDate
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      console.error(err);

      return {
        minDataDate: null,
        maxDataDate: null
      }
    });
}
