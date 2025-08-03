import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
  breadcrumbs: Breadcrumb[];
  loadingStates: {
    [key: string]: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Breadcrumb {
  label: string;
  path: string;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  modals: {},
  breadcrumbs: [],
  loadingStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setModalOpen: (state, action: PayloadAction<{ modal: string; open: boolean }>) => {
      state.modals[action.payload.modal] = action.payload.open;
    },
    setBreadcrumbs: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.breadcrumbs = action.payload;
    },
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  markNotificationRead,
  clearNotifications,
  setModalOpen,
  setBreadcrumbs,
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions;

export default uiSlice.reducer; 