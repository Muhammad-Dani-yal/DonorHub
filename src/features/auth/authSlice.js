import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, ready: false },
  reducers: {
    setAuthenticatedUser: (state, action) => { state.user = action.payload; },
    clearAuthenticatedUser: (state) => { state.user = null; },
    setAuthReady: (state, action) => { state.ready = action.payload; },
    mergeUserProfile: (state, action) => {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
});

export const { clearAuthenticatedUser, mergeUserProfile, setAuthenticatedUser, setAuthReady } = authSlice.actions;
export default authSlice.reducer;
