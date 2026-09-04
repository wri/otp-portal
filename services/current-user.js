// The shape the store expects. Built the same way whether the user was resolved
// during SSR or client-side on a prerendered page, so the two cannot drift.
export const mapCurrentUser = (data) => ({
  user_id: data.id,
  country: data['country-id'],
  observer: data['observer-id'],
  operator_ids: data['operator-ids'] || [],
  role: (data['user-permission'] && data['user-permission']['user-role']) || 'user'
});
