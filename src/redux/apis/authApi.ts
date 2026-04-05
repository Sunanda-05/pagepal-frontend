import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseUser } from "@/types/user";
import { login, logout } from "@/redux/features/userSlice";
import type { RootState } from "@/redux/store";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if(!backendUrl) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: backendUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),

  endpoints: (builder) => ({
    login: builder.mutation<
      { user: BaseUser; accessToken: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            login({
              email: arg.email,
              username: data.user.username,
              role: data.user.role,
              accessToken: data.accessToken,
            })
          );

          // dispatch(authApi.util.resetApiState());
        } catch (err) {
          console.error("Login failed", err);
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          console.error("Logout failed", err);
        }
      },
    }),

    register: builder.mutation<
      { message: string },
      { email: string; password: string; username: string; name?: string }
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Show a success toast or redirect to login page
        } catch (err) {
          console.error("Registration failed", err);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } =
  authApi;
