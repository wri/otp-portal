import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getHowtos = createAsyncThunk(
  'help/getHowtos',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('how-tos', { locale: language });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

export const getTools = createAsyncThunk(
  'help/getTools',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('tools', { locale: language });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

export const getFAQs = createAsyncThunk(
  'help/getFAQs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('faqs', { locale: language });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

export const getTutorials = createAsyncThunk(
  'help/getTutorials',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('tutorials', { locale: language });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  howtos: {
    data: [],
    loading: false,
    error: false
  },
  tools: {
    data: [],
    loading: false,
    error: false
  },
  faqs: {
    data: [],
    loading: false,
    error: false
  },
  tutorials: {
    data: [],
    loading: false,
    error: false
  }
};

const helpSlice = createSlice({
  name: 'help',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHowtos.pending, (state) => {
        state.howtos.loading = true;
        state.howtos.error = false;
      })
      .addCase(getHowtos.fulfilled, (state, action) => {
        state.howtos.data = action.payload;
        state.howtos.loading = false;
        state.howtos.error = false;
      })
      .addCase(getHowtos.rejected, (state) => {
        state.howtos.error = true;
        state.howtos.loading = false;
      })
      .addCase(getTools.pending, (state) => {
        state.tools.loading = true;
        state.tools.error = false;
      })
      .addCase(getTools.fulfilled, (state, action) => {
        state.tools.data = action.payload;
        state.tools.loading = false;
        state.tools.error = false;
      })
      .addCase(getTools.rejected, (state) => {
        state.tools.error = true;
        state.tools.loading = false;
      })
      .addCase(getFAQs.pending, (state) => {
        state.faqs.loading = true;
        state.faqs.error = false;
      })
      .addCase(getFAQs.fulfilled, (state, action) => {
        state.faqs.data = action.payload;
        state.faqs.loading = false;
        state.faqs.error = false;
      })
      .addCase(getFAQs.rejected, (state) => {
        state.faqs.error = true;
        state.faqs.loading = false;
      })
      .addCase(getTutorials.pending, (state) => {
        state.tutorials.loading = true;
        state.tutorials.error = false;
      })
      .addCase(getTutorials.fulfilled, (state, action) => {
        state.tutorials.data = action.payload;
        state.tutorials.loading = false;
        state.tutorials.error = false;
      })
      .addCase(getTutorials.rejected, (state) => {
        state.tutorials.error = true;
        state.tutorials.loading = false;
      });
  },
});

export default helpSlice.reducer;
