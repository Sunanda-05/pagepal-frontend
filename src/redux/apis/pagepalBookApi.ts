import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Book, Review } from "@/types/pagepal";
import { pagepalApi } from "@/redux/apis/pagepalApi";
import {
  BackendBook,
  BackendReview,
  BooksQueryParams,
  CursorResponse,
  PaginatedResponse,
  mapBook,
  mapReview,
  normalizeGenre,
  toCursorResponse,
} from "@/redux/apis/pagepalContracts";

export interface BookMutationBody {
  title: string;
  description: string;
  genre: string;
  publishedYear: number;
  isbn: string;
}

export interface CreateReviewBody {
  bookId: string;
  review: string;
}

export interface UpdateReviewBody {
  bookId: string;
  reviewId: string;
  review: string;
}

export interface TagSummary {
  id: string;
  name: string;
  usageCount: number;
}

interface RawTagResponse {
  id: string;
  name: string;
  _count?: {
    books?: number;
  };
}

function mapBookListResponse(response: PaginatedResponse<BackendBook>): CursorResponse<Book> {
  return toCursorResponse((response?.data ?? []).map((book) => mapBook(book)));
}

export const pagepalBookApi = pagepalApi.injectEndpoints({
    overrideExisting: true,
  endpoints: (builder) => ({
    getBooks: builder.query<CursorResponse<Book>, BooksQueryParams | void>({
      query: (params) => ({
        url: "/books",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: PaginatedResponse<BackendBook>) => mapBookListResponse(response),
      providesTags: ["BookList"],
    }),

    getFilteredBooks: builder.query<CursorResponse<Book>, BooksQueryParams | void>({
      query: (params) => ({
        url: "/books/filters",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: PaginatedResponse<BackendBook>) => mapBookListResponse(response),
      providesTags: ["BookList"],
    }),

    getBookById: builder.query<Book | null, string>({
      query: (bookId) => ({ url: `/books/${bookId}`, method: "GET" }),
      transformResponse: (response: BackendBook | null) => (response ? mapBook(response) : null),
      providesTags: (_res, _err, bookId) => [{ type: "Book", id: bookId }],
    }),

    createBook: builder.mutation<Book, BookMutationBody>({
      query: (body) => ({
        url: "/books",
        method: "POST",
        body: {
          ...body,
          genre: normalizeGenre(body.genre),
        },
      }),
      transformResponse: (response: BackendBook) => mapBook(response),
      invalidatesTags: ["BookList", "Me"],
    }),

    patchBook: builder.mutation<Book, BookMutationBody & { id: string }>({
      async queryFn({ id, ...payload }, _api, _extraOptions, baseQuery) {
        let result = await baseQuery({
          url: `/books/${id}`,
          method: "PATCH",
          body: {
            ...payload,
            genre: normalizeGenre(payload.genre),
          },
        });

        if (result.error && (result.error.status === 404 || result.error.status === 405)) {
          result = await baseQuery({
            url: "/books",
            method: "PATCH",
            body: {
              id,
              ...payload,
              genre: normalizeGenre(payload.genre),
            },
          });
        }

        if (result.error) {
          return { error: result.error as FetchBaseQueryError };
        }

        return { data: mapBook(result.data as BackendBook) };
      },
      invalidatesTags: (_res, _err, body) => [
        "BookList",
        { type: "Book", id: body.id },
      ],
    }),

    deleteBook: builder.mutation<unknown, { id: string }>({
      async queryFn({ id }, _api, _extraOptions, baseQuery) {
        let result = await baseQuery({
          url: `/books/${id}`,
          method: "DELETE",
        });

        if (result.error && (result.error.status === 404 || result.error.status === 405)) {
          result = await baseQuery({
            url: "/books",
            method: "DELETE",
            body: { id },
          });
        }

        if (result.error) {
          return { error: result.error as FetchBaseQueryError };
        }

        return { data: result.data };
      },
      invalidatesTags: ["BookList", "CollectionList", "Me"],
    }),

    getTags: builder.query<TagSummary[], void>({
      query: () => ({ url: "/tag", method: "GET" }),
      transformResponse: (response: RawTagResponse[]) =>
        (response ?? []).map((tag) => ({
          id: tag.id,
          name: tag.name,
          usageCount: tag._count?.books ?? 0,
        })),
      providesTags: ["Tag"],
    }),

    createTag: builder.mutation<TagSummary, { name: string }>({
      query: (body) => ({ url: "/tag", method: "POST", body }),
      transformResponse: (response: RawTagResponse) => ({
        id: response.id,
        name: response.name,
        usageCount: response._count?.books ?? 0,
      }),
      invalidatesTags: ["Tag"],
    }),

    addBookTag: builder.mutation<unknown, { bookId: string; tagId: string }>({
      query: ({ bookId, tagId }) => ({
        url: `/books/${bookId}/tag`,
        method: "POST",
        body: { tagId },
      }),
      invalidatesTags: (_res, _err, arg) => [
        "Tag",
        { type: "Book", id: arg.bookId },
      ],
    }),

    getBooksByTag: builder.query<CursorResponse<Book>, { tagId: string }>({
      query: ({ tagId }) => ({
        url: `/tag/${tagId}/books`,
        method: "GET",
      }),
      transformResponse: (response: BackendBook[]) =>
        toCursorResponse((response ?? []).map((book) => mapBook(book))),
      providesTags: ["BookList", "Tag"],
    }),

    submitRating: builder.mutation<unknown, { bookId: string; rating: number }>({
      query: ({ bookId, rating }) => ({
        url: `/books/${bookId}/ratings`,
        method: "POST",
        body: { rating },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Book", id: arg.bookId },
        { type: "Review", id: arg.bookId },
      ],
    }),

    getRatings: builder.query<{ average: number; count: number }, { bookId: string }>({
      query: ({ bookId }) => ({
        url: `/books/${bookId}/ratings`,
        method: "GET",
      }),
      transformResponse: (response: Array<{ rating: number }>) => {
        const count = response?.length ?? 0;
        if (!count) {
          return { average: 0, count: 0 };
        }

        const total = response.reduce((sum, row) => sum + row.rating, 0);
        return {
          average: Number((total / count).toFixed(2)),
          count,
        };
      },
      providesTags: (_res, _err, arg) => [{ type: "Book", id: arg.bookId }],
    }),

    createReview: builder.mutation<Review, CreateReviewBody>({
      query: ({ bookId, review }) => ({
        url: `/books/${bookId}/reviews`,
        method: "POST",
        body: { review },
      }),
      transformResponse: (response: BackendReview) => mapReview(response),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Review", id: arg.bookId },
        { type: "Book", id: arg.bookId },
      ],
    }),

    getReviews: builder.query<CursorResponse<Review>, { bookId: string }>({
      query: ({ bookId }) => ({
        url: `/books/${bookId}/reviews`,
        method: "GET",
      }),
      transformResponse: (response: BackendReview[]) =>
        toCursorResponse((response ?? []).map((review) => mapReview(review))),
      providesTags: (_res, _err, arg) => [{ type: "Review", id: arg.bookId }],
    }),

    updateReview: builder.mutation<Review, UpdateReviewBody>({
      query: ({ bookId, reviewId, review }) => ({
        url: `/books/${bookId}/reviews/${reviewId}`,
        method: "PATCH",
        body: { review },
      }),
      transformResponse: (response: BackendReview) => mapReview(response),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Review", id: arg.bookId },
        { type: "Book", id: arg.bookId },
      ],
    }),

    deleteReview: builder.mutation<unknown, { bookId: string; reviewId: string }>({
      query: ({ bookId, reviewId }) => ({
        url: `/books/${bookId}/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Review", id: arg.bookId },
        { type: "Book", id: arg.bookId },
      ],
    }),
  }),
});

export const {
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
} = pagepalBookApi;
