// slice/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  signUpData: any;
  loading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("flostatToken")
    ? JSON.parse(localStorage.getItem("flostatToken") as string)
    : null,
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  signUpData: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },

    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSignUpData: (state, action: PayloadAction<any>) => {
      state.signUpData = action.payload;
    },

    logOut: (state) => {
      localStorage.removeItem("flostatToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentOrganization");
      state.token = null;
      state.user = null;
      state.signUpData = null;
    },
  },
});

export const { setLoading, setSignUpData, loginSuccess, setToken, logOut } =
  authSlice.actions;

export default authSlice.reducer;
