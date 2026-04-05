import {
  AuthorApplication,
  Book,
  Collection,
  CollectionVisibility,
  PagePalUser,
  Review,
} from "@/types/pagepal";

export interface CursorResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BooksQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  genre?: string;
  authorName?: string;
  publishedYear?: number;
}

export interface BackendUser {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string | null;
  role: "USER" | "AUTHOR" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendBook {
  id?: string;
  title: string;
  description?: string;
  genre: string;
  publishedYear: number;
  isbn?: string;
  author?: {
    id?: string;
    name?: string;
  } | null;
  authorId?: string;
  ratings?: Array<{
    rating: number;
  }>;
  reviews?: Array<unknown>;
  tags?: Array<{
    tag?: {
      id: string;
      name: string;
    };
  }>;
}

export interface BackendCollectionBook {
  readingStatus?: string;
  book?: {
    id?: string;
    title?: string;
    genre?: string;
    author?: {
      id?: string;
      name?: string;
    };
  };
}

export interface BackendCollection {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  userId?: string;
  user?: {
    name?: string;
    email?: string;
  };
  books?: BackendCollectionBook[];
}

export interface BackendReview {
  id: string;
  userId: string;
  bookId: string;
  reviewText: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BackendAuthorApplication {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  reason?: string | null;
  user?: {
    id: string;
    name: string;
  };
}

function asDisplayId(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function asVisibility(isPublic: boolean): CollectionVisibility {
  return isPublic ? "public" : "private";
}

function asSafeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0;
}

export function normalizeGenre(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

export function mapUser(raw: BackendUser): PagePalUser {
  return {
    id: raw.id,
    displayName: raw.name,
    username: raw.username,
    bio: raw.bio ?? "",
    role: raw.role,
    followersCount: 0,
    followingCount: 0,
    booksRead: 0,
    reviewsWritten: 0,
  };
}

export function mapBook(raw: BackendBook): Book {
  const ratings = Array.isArray(raw.ratings) ? raw.ratings : [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, item) => sum + asSafeNumber(item.rating), 0) / ratings.length
      : 0;

  const fallbackId = asDisplayId(
    `${raw.title}-${raw.publishedYear}-${raw.author?.name ?? "unknown"}`
  );

  return {
    id: raw.id ?? fallbackId,
    title: raw.title,
    authorId: raw.author?.id ?? raw.authorId ?? "",
    authorName: raw.author?.name ?? "Unknown",
    description: raw.description ?? "",
    genre: raw.genre,
    year: raw.publishedYear,
    isbn: raw.isbn ?? "",
    avgRating: Number(avgRating.toFixed(2)),
    reviewCount: Array.isArray(raw.reviews) ? raw.reviews.length : ratings.length,
    coverTone: "primary",
    tags:
      raw.tags
        ?.map((item) => item.tag?.name)
        .filter((tag): tag is string => Boolean(tag)) ?? [],
  };
}

export function mapCollection(raw: BackendCollection): Collection {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    ownerId: raw.userId ?? "",
    ownerName: raw.user?.name ?? "Unknown",
    visibility: asVisibility(raw.isPublic),
    books:
      raw.books
        ?.map((entry) => {
          const id = entry.book?.id;
          if (!id) return null;

          return {
            bookId: id,
            readingStatus:
              entry.readingStatus === "READING"
                ? "reading"
                : entry.readingStatus === "FINISHED"
                ? "read"
                : "want_to_read",
          };
        })
        .filter((entry): entry is Collection["books"][number] => Boolean(entry)) ?? [],
  };
}

export function mapReview(raw: BackendReview): Review {
  return {
    id: raw.id,
    bookId: raw.bookId,
    userId: raw.userId,
    userName: raw.user?.name ?? "Unknown",
    createdAt: raw.createdAt,
    rating: 0,
    text: raw.reviewText,
  };
}

export function mapAuthorApplication(raw: BackendAuthorApplication): AuthorApplication {
  return {
    id: raw.id,
    userId: raw.userId,
    userName: raw.user?.name ?? raw.userId,
    motivation: raw.bio ?? "",
    status: raw.status.toLowerCase() as AuthorApplication["status"],
    reason: raw.reason ?? undefined,
    submittedAt: raw.createdAt,
  };
}

export function toCursorResponse<T>(items: T[]): CursorResponse<T> {
  return {
    items,
    nextCursor: null,
  };
}
