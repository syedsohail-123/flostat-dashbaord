// slice/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userOrgs: any[] | [];
}

const initialState: UserState = {
  userOrgs: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserOrgs: (state, action: PayloadAction<any[]>) => {
      state.userOrgs = action.payload;
    },
  },
});

export const { setUserOrgs } = userSlice.actions;
export default userSlice.reducer;
