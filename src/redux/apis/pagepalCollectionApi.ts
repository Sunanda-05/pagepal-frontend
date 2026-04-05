import { Collection } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendCollection,
  CursorResponse,
  mapCollection,
  toCursorResponse,
} from "@/redux/apis/pagepalContracts";

export interface CollectionMutationBody {
  name: string;
  description: string;
  isPublic: boolean;
}

export interface CollectionBookMutationBody {
  collectionId: string;
  bookId: string;
  readingStatus: "want_to_read" | "reading" | "read";
}

function toBackendReadingStatus(value: CollectionBookMutationBody["readingStatus"]): "TO_READ" | "READING" | "FINISHED" {
  if (value === "reading") return "READING";
  if (value === "read") return "FINISHED";
  return "TO_READ";
}

export const pagepalCollectionApi = pagepalApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPublicCollections: builder.query<CursorResponse<Collection>, void>({
      query: () => ({
        url: "/collection/public",
        method: "GET",
      }),
      transformResponse: (response: BackendCollection[]) =>
        toCursorResponse((response ?? []).map((collection) => ({
            ...mapCollection(collection),
            visibility: "public",
          }))),
      providesTags: ["CollectionList"],
    }),

    getMyCollections: builder.query<CursorResponse<Collection>, void>({
      query: () => ({
        url: "/collection/me",
        method: "GET",
      }),
      transformResponse: (response: BackendCollection[]) =>
        toCursorResponse((response ?? []).map((collection) => ({
            ...mapCollection(collection),
            visibility: collection.isPublic ? "public" : "private",
          }))),
      providesTags: ["CollectionList", "Me"],
    }),

    getSharedCollections: builder.query<CursorResponse<Collection>, void>({
      query: () => ({
        url: "/collection/shared",
        method: "GET",
      }),
      transformResponse: (response: BackendCollection[]) =>
        toCursorResponse(
          (response ?? []).map((collection) => ({
            ...mapCollection(collection),
            visibility: "shared",
          }))
        ),
      providesTags: ["CollectionList"],
    }),

    getCollectionById: builder.query<Collection | null, string>({
      query: (id) => ({ url: `/collection/${id}`, method: "GET" }),
      transformResponse: (response: BackendCollection | null) => (response ? mapCollection(response) : null),
      providesTags: (_res, _err, id) => [{ type: "Collection", id }],
    }),

    createCollection: builder.mutation<Collection, CollectionMutationBody>({
      query: (body) => ({
        url: "/collection",
        method: "POST",
        body: {
          title: body.name,
          description: body.description,
          isPublic: body.isPublic,
        },
      }),
      transformResponse: (response: BackendCollection) => mapCollection(response),
      invalidatesTags: ["CollectionList", "Me"],
    }),

    updateCollection: builder.mutation<Collection, CollectionMutationBody & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/collection/${id}`,
        method: "PATCH",
        body: {
          name: body.name,
          description: body.description,
          isPublic: body.isPublic,
        },
      }),
      transformResponse: (response: BackendCollection) => mapCollection(response),
      invalidatesTags: (_res, _err, arg) => [
        "CollectionList",
        { type: "Collection", id: arg.id },
      ],
    }),

    deleteCollection: builder.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/collection/${id}`, method: "DELETE" }),
      invalidatesTags: ["CollectionList", "Me"],
    }),

    addBookToCollection: builder.mutation<unknown, CollectionBookMutationBody>({
      query: ({ collectionId, bookId, readingStatus }) => ({
        url: `/collection/${collectionId}/books`,
        method: "POST",
        body: {
          bookId,
          readingStatus: toBackendReadingStatus(readingStatus),
        },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Collection", id: arg.collectionId },
        "CollectionList",
      ],
    }),

    removeBookFromCollection: builder.mutation<
      unknown,
      { collectionId: string; bookId: string }
    >({
      query: ({ collectionId, bookId }) => ({
        url: `/collection/${collectionId}/books/${bookId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Collection", id: arg.collectionId },
        "CollectionList",
      ],
    }),

    shareCollection: builder.mutation<unknown, { collectionId: string; userId: string }>({
      query: ({ collectionId, userId }) => ({
        url: `/collection/${collectionId}/share`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Collection", id: arg.collectionId },
        "CollectionList",
      ],
    }),
  }),
});

export const {
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
} = pagepalCollectionApi;
