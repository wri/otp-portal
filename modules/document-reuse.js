import { createSlice } from '@reduxjs/toolkit';

import { fetchReusableDocuments } from 'services/documents';
import { createServiceThunk } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

const buildCacheKey = (operatorIds) =>
  [...operatorIds].map(Number).sort((a, b) => a - b).join(',');

export const getReusableDocuments = createServiceThunk(
  'documentReuse/getReusableDocuments',
  async (operatorIds, { documentReuse, language }) => {
    const cacheKey = buildCacheKey(operatorIds);
    if (documentReuse.cacheKey === cacheKey && documentReuse.data.length) {
      return { skip: true };
    }

    const data = await fetchReusableDocuments(operatorIds, language);
    return { data, cacheKey };
  }
);

const documentReuseSlice = createSlice({
  name: 'documentReuse',
  initialState: {
    data: [],
    cacheKey: null,
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReusableDocuments.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getReusableDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        if (action.payload?.skip) return;
        state.data = action.payload.data;
        state.cacheKey = action.payload.cacheKey;
      })
      .addCase(getReusableDocuments.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

registerReducer('documentReuse', documentReuseSlice.reducer);

export default documentReuseSlice.reducer;
