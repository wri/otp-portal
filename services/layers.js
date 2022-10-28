export function fetchIntegratedAlertsMetadata() {
  return fetch(`${process.env.GFW_API}/dataset/gfw_integrated_alerts/latest`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then(({ data }) => {
      const minDataDate = data.metadata.content_date_range.min;
      const maxDataDate = data.metadata.content_date_range.max;

      return {
        minDataDate,
        maxDataDate
      }
    })
    .catch((err) => {
      console.error(err);
      const date = new Date();

      return {
        minDataDate: date.toISOString(),
        maxDataDate: date.toISOString()
      }
    });
}
