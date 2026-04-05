import { AuthorApplication } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendAuthorApplication,
  CursorResponse,
  mapAuthorApplication,
  toCursorResponse,
} from "@/redux/apis/pagepalContracts";

export interface AdminReviewApplicationBody {
  id: string;
  status: "APPROVED" | "REJECTED";
  reason?: string;
}

export const pagepalAdminApi = pagepalApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminAuthorApplications: builder.query<
      CursorResponse<AuthorApplication>,
      { status?: "PENDING" | "APPROVED" | "REJECTED" }
    >({
      query: ({ status }) => ({
        url: "/admin/author-applications",
        method: "GET",
        params: { status },
      }),
      transformResponse: (response: BackendAuthorApplication[]) =>
        toCursorResponse((response ?? []).map((application) => mapAuthorApplication(application))),
      providesTags: ["AdminApplication"],
    }),

    reviewAuthorApplication: builder.mutation<AuthorApplication, AdminReviewApplicationBody>({
      query: ({ id, status, reason }) => ({
        url: `/admin/author-applications/${id}`,
        method: "POST",
        body: { status, reason },
      }),
      transformResponse: (response: BackendAuthorApplication) =>
        mapAuthorApplication(response),
      invalidatesTags: ["AdminApplication", "AuthorApplication", "Me"],
    }),
  }),
});

export const { useGetAdminAuthorApplicationsQuery, useReviewAuthorApplicationMutation } =
  pagepalAdminApi;
