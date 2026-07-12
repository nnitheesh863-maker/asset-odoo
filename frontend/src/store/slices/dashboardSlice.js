import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAdminDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load admin dashboard');
    }
  }
);

export const fetchManagerDashboard = createAsyncThunk(
  'dashboard/fetchManager',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getManagerDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load manager dashboard');
    }
  }
);

export const fetchEmployeeDashboard = createAsyncThunk(
  'dashboard/fetchEmployee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getEmployeeDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load employee dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    adminData: null,
    managerData: null,
    employeeData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboard(state) {
      state.adminData = null;
      state.managerData = null;
      state.employeeData = null;
      state.error = null;
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Manager Dashboard
      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.managerData = action.payload;
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Employee Dashboard
      .addCase(fetchEmployeeDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeData = action.payload;
      })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboard, clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
