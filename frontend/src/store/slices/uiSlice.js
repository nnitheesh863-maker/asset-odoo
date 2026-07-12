import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    darkMode: localStorage.getItem('darkMode') === 'true' || false,
    notifications: [],
    loading: false,
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', String(action.payload));
    },
    addNotification(state, action) {
      state.notifications.unshift({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    markNotificationRead(state, action) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setDarkMode,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationRead,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
