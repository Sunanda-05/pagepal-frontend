import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { logout, updateToken } from "../features/userSlice";
import type { RootState } from "../store";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if(!backendUrl) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).user.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

async function attemptTokenRefresh(
  api: any,
  extraOptions: any
): Promise<string | null> {
  try {
    const refreshResponse = await rawBaseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
        credentials: "include",
      },
      api,
      extraOptions
    );

    if (refreshResponse.error) {
      console.warn("Token refresh failed:", refreshResponse.error);
      api.dispatch(logout());
      return null;
    }

    const data = refreshResponse.data as { accessToken?: string } | undefined;

    if (data?.accessToken) {
      api.dispatch(updateToken(data.accessToken));
      console.info("Access token refreshed successfully");
      return data.accessToken;
    }

    console.warn("No access token returned from refresh endpoint");
    api.dispatch(logout());
    return null;
  } catch (err) {
    console.error("Unexpected error during token refresh:", err);
    api.dispatch(logout());
    return null;
  }
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Access token expired — attempting refresh…");

    const newAccessToken = await attemptTokenRefresh(api, extraOptions);

    if (newAccessToken) {
      // Retry the original request with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.warn("Refresh failed — user logged out");
    }
  }

  return result;
};
