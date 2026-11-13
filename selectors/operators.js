// Falls back to the id, which proxy.js redirects to the slug url, for operators outside the list.
export const getOperatorSlug = (state, id) => (
  state.operators.data.find((o) => String(o.id) === String(id))?.slug || id
);
