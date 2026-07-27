import { createSlice } from "@reduxjs/toolkit";

const donorsSlice = createSlice({
  name: "donors",
  initialState: { items: [] },
  reducers: {
    setDonors: (state, action) => { state.items = action.payload; },
  },
});

export const { setDonors } = donorsSlice.actions;
export default donorsSlice.reducer;
