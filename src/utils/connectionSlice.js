import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connnections",
  initialState: null,
  reducers: {
    addConnection: (state, action) => action.payload,
    removeConnection: () => null,
  },
});

export const { addConnection, removeConnection } = connectionSlice.actions;
export default connectionSlice.reducer;
