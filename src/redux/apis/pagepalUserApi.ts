import { Book, PagePalUser } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendBook,
  BackendUser,
  CursorResponse,
  mapBook,
  mapUser,
  toCursorResponse,
} from "@/redux/apis/pagepalContracts";

export interface FollowMutationBody {
  userId: string;
  type: "user" | "author";
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
      invalidatesTags: ["Me", "User"],
    }),

    unfollowUser: builder.mutation<unknown, FollowMutationBody>({
      query: ({ userId, type }) => ({
        url: `/user/${userId}/unfollow`,
        method: "DELETE",
        params: { type },
      }),
      invalidatesTags: ["Me", "User"],
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
  useGetRecommendationsQuery,
} = pagepalUserApi;
