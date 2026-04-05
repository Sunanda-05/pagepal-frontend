import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/redux/apis/baseQuery";

export const pagepalApi = createApi({
  reducerPath: "pagepalApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Me",
    "User",
    "Book",
    "BookList",
    "Review",
    "Collection",
    "CollectionList",
    "Recommendation",
    "FollowList",
    "Tag",
    "AuthorApplication",
    "AdminApplication",
  ],
  endpoints: () => ({}),
});
