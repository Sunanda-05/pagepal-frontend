import { AuthUser } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthUser = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        email: string;
        username: string;
        role: string;
        accessToken: string;
      }>
    ) => {
      state.user = {
        email: action.payload.email,
        username: action.payload.username,
        role: action.payload.role,
      };
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { login, logout, updateToken } = userSlice.actions;
export default userSlice.reducer;
