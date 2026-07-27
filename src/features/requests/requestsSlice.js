import { createSlice } from "@reduxjs/toolkit";

const requestsSlice = createSlice({
  name: "requests",
  initialState: { items: [] },
  reducers: {
    setRequests: (state, action) => { state.items = action.payload; },
  },
});

export const { setRequests } = requestsSlice.actions;
export default requestsSlice.reducer;
