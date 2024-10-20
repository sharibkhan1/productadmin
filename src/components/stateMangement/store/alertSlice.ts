import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
  type: "default" | "destructive";
  message: string;
  action?: string;
}

const initialState: AlertState = {
  type: "default",
  message: "",
  action: undefined,
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert(state, action: PayloadAction<AlertState>) {
      return action.payload;
    },
    clearAlert(state) {
      state.message = "";
    },
  },
});

export const { showAlert, clearAlert } = alertSlice.actions;
export default alertSlice.reducer;
