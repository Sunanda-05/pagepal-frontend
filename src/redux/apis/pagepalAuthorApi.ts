import { AuthorApplication } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendAuthorApplication,
  mapAuthorApplication,
} from "@/redux/apis/pagepalContracts";

export const pagepalAuthorApi = pagepalApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    submitAuthorApplication: builder.mutation<AuthorApplication, { bio: string }>({
      query: (body) => ({
        url: "/author/apply",
        method: "POST",
        body,
      }),
      transformResponse: (response: BackendAuthorApplication) =>
        mapAuthorApplication(response),
      invalidatesTags: ["AuthorApplication", "Me"],
    }),

    getAuthorApplication: builder.query<AuthorApplication[], void>({
      query: () => ({ url: "/author/application", method: "GET" }),
      transformResponse: (response: BackendAuthorApplication[]) =>
        (response ?? []).map((application) => mapAuthorApplication(application)),
      providesTags: ["AuthorApplication"],
    }),
  }),
});

export const { useSubmitAuthorApplicationMutation, useGetAuthorApplicationQuery } =
  pagepalAuthorApi;
