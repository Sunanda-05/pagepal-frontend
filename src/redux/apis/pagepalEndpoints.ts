export { pagepalApi } from "@/redux/apis/pagepalApi";

export * from "@/redux/apis/pagepalContracts";

export {
  useGetMeQuery,
  usePatchMeMutation,
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetRecommendationsQuery,
} from "@/redux/apis/pagepalUserApi";

export {
  useGetBooksQuery,
  useGetFilteredBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  usePatchBookMutation,
  useDeleteBookMutation,
  useGetTagsQuery,
  useCreateTagMutation,
  useAddBookTagMutation,
  useGetBooksByTagQuery,
  useSubmitRatingMutation,
  useGetRatingsQuery,
  useCreateReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/redux/apis/pagepalBookApi";

export {
  useGetPublicCollectionsQuery,
  useGetMyCollectionsQuery,
  useGetSharedCollectionsQuery,
  useGetCollectionByIdQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddBookToCollectionMutation,
  useRemoveBookFromCollectionMutation,
  useShareCollectionMutation,
} from "@/redux/apis/pagepalCollectionApi";

export {
  useSubmitAuthorApplicationMutation,
  useGetAuthorApplicationQuery,
} from "@/redux/apis/pagepalAuthorApi";

export {
  useGetAdminAuthorApplicationsQuery,
  useReviewAuthorApplicationMutation,
} from "@/redux/apis/pagepalAdminApi";
