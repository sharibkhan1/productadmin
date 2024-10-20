import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './alertSlice';

const store = configureStore({
  reducer: {
    alert: alertReducer,
    // other reducers can be added here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
