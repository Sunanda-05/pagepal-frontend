import { Book, PagePalUser } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendBook,
  BackendUser,
  CursorResponse,
  PaginatedResponse,
  mapBook,
  mapUser,
  toCursorResponse,
} from "@/redux/apis/pagepalContracts";

export interface FollowMutationBody {
  userId: string;
  type: "user" | "author";
}

export interface FollowListQueryParams {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserSearchQueryParams {
  query: string;
  page?: number;
  limit?: number;
}

export const pagepalUserApi = pagepalApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMe: builder.query<PagePalUser, void>({
      query: () => ({ url: "/user/me", method: "GET" }),
      transformResponse: (response: BackendUser) => mapUser(response),
      providesTags: ["Me"],
    }),

    patchMe: builder.mutation<
      PagePalUser,
      Partial<{
        name: string;
        bio: string;
        username: string;
        email: string;
      }>
    >({
      query: (body) => ({
        url: "/user",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: BackendUser) => mapUser(response),
      invalidatesTags: ["Me", "User"],
    }),

    getUserById: builder.query<PagePalUser, string>({
      query: (userId) => ({ url: `/user/${userId}`, method: "GET" }),
      transformResponse: (response: BackendUser) => mapUser(response),
      providesTags: (_result, _err, userId) => [{ type: "User", id: userId }],
    }),

    followUser: builder.mutation<unknown, FollowMutationBody>({
      query: ({ userId, type }) => ({
        url: `/user/${userId}/follow`,
        method: "POST",
        params: { type },
      }),
      invalidatesTags: ["Me", "User", "FollowList"],
    }),

    unfollowUser: builder.mutation<unknown, FollowMutationBody>({
      query: ({ userId, type }) => ({
        url: `/user/${userId}/unfollow`,
        method: "DELETE",
        params: { type },
      }),
      invalidatesTags: ["Me", "User", "FollowList"],
    }),

    removeFollower: builder.mutation<unknown, { followerId: string }>({
      query: ({ followerId }) => ({
        url: `/user/${followerId}/remove-follower`,
        method: "DELETE",
      }),
      invalidatesTags: ["Me", "User", "FollowList"],
    }),

    getUserFollowers: builder.query<PaginatedResponse<PagePalUser>, FollowListQueryParams>({
      query: ({ userId, page = 1, limit = 20, search }) => ({
        url: `/user/${userId}/followers`,
        method: "GET",
        params: {
          type: "user",
          page,
          limit,
          search: search?.trim() ? search.trim() : undefined,
        },
      }),
      transformResponse: (response: PaginatedResponse<BackendUser>) => ({
        data: (response?.data ?? []).map((user) => mapUser(user)),
        meta: response?.meta,
      }),
      providesTags: ["FollowList"],
    }),

    getUserFollowing: builder.query<PaginatedResponse<PagePalUser>, FollowListQueryParams>({
      query: ({ userId, page = 1, limit = 20, search }) => ({
        url: `/user/${userId}/following`,
        method: "GET",
        params: {
          page,
          limit,
          search: search?.trim() ? search.trim() : undefined,
        },
      }),
      transformResponse: (response: PaginatedResponse<BackendUser>) => ({
        data: (response?.data ?? []).map((user) => mapUser(user)),
        meta: response?.meta,
      }),
      providesTags: ["FollowList"],
    }),

    searchUsers: builder.query<PaginatedResponse<PagePalUser>, UserSearchQueryParams>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/user/search",
        method: "GET",
        params: {
          query: query.trim(),
          page,
          limit,
        },
      }),
      transformResponse: (response: PaginatedResponse<BackendUser>) => ({
        data: (response?.data ?? []).map((user) => mapUser(user)),
        meta: response?.meta,
      }),
      providesTags: ["User"],
    }),

    getFollowSuggestions: builder.query<PagePalUser[], { limit?: number } | void>({
      query: (arg) => ({
        url: "/user/suggestions",
        method: "GET",
        params: {
          limit: arg?.limit ?? 8,
        },
      }),
      transformResponse: (response: BackendUser[]) => (response ?? []).map((user) => mapUser(user)),
      providesTags: ["FollowList", "User"],
    }),

    getRecommendations: builder.query<CursorResponse<Book>, void>({
      query: () => ({
        url: "/user/recommendations",
        method: "GET",
      }),
      transformResponse: (response: BackendBook[]) =>
        toCursorResponse((response ?? []).map((book) => mapBook(book))),
      providesTags: ["Recommendation"],
    }),
  }),
});

export const {
  useGetMeQuery,
  usePatchMeMutation,
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useRemoveFollowerMutation,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
  useSearchUsersQuery,
  useGetFollowSuggestionsQuery,
  useGetRecommendationsQuery,
} = pagepalUserApi;
