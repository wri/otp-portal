import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import API from 'services/api';
import { parseDocument } from 'utils/documents';

const buildCacheKey = (operatorIds) =>
  [...operatorIds].map(Number).sort((a, b) => a - b).join(',');

export const getReusableDocuments = createAsyncThunk(
  'documentReuse/getReusableDocuments',
  async (operatorIds, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cacheKey = buildCacheKey(operatorIds);

      if (state.documentReuse.cacheKey === cacheKey && state.documentReuse.data.length) {
        return { skip: true };
      }

      const token = state.user.token;
      const locale = state.language;

      const include = [
        'operator',
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
        'operator-document-annexes',
        'fmu',
      ].join(',');

      const responses = await Promise.all(
        operatorIds.map((operatorId) =>
          API.get(
            'operator-documents',
            {
              locale,
              include,
              'page[size]': 1000,
              'fields[fmus]': 'name',
              'fields[operators]': 'name',
              'filter[operator-id]': operatorId,
            },
            { token }
          ).then(({ data }) => ({ operatorId, data }))
        )
      );

      const operatorsById = {};
      const data = [];

      responses.forEach(({ operatorId, data: docs }) => {
        (docs || []).forEach((doc) => {
          try {
            if (!doc.attachment?.url) return;
            const parsed = parseDocument(doc);
            if (!parsed) return;
            const operator = doc.operator || null;
            const opId = operator?.id || operatorId;
            const opName = operator?.name || null;
            if (opName && !operatorsById[opId]) {
              operatorsById[opId] = { id: opId, name: opName };
            }
            data.push({
              ...parsed,
              operatorId: opId,
              operatorName: opName,
            });
          } catch (e) {
            // skip malformed doc
          }
        });
      });

      return { data, operatorsById, cacheKey };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const documentReuseSlice = createSlice({
  name: 'documentReuse',
  initialState: {
    data: [],
    operatorsById: {},
    cacheKey: null,
    loading: false,
    error: false,
  },
  reducers: {
    resetReusableDocuments: (state) => {
      state.data = [];
      state.operatorsById = {};
      state.cacheKey = null;
      state.loading = false;
      state.error = false;
    },
  },
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
        state.operatorsById = action.payload.operatorsById;
        state.cacheKey = action.payload.cacheKey;
      })
      .addCase(getReusableDocuments.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const { resetReusableDocuments } = documentReuseSlice.actions;
export default documentReuseSlice.reducer;
