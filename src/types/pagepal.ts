export type UserRole = "GUEST" | "USER" | "AUTHOR" | "ADMIN";

export type Zone = "A" | "B" | "C" | "D" | "E";

export type ReadingStatus = "want_to_read" | "reading" | "read";

export type CollectionVisibility = "public" | "shared" | "private";

export type ActivityAction =
  | "reviewed"
  | "rated"
  | "added_to_shelf"
  | "created_collection"
  | "followed";

export interface PagePalUser {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  booksRead: number;
  reviewsWritten: number;
  isFollowing?: boolean;
  followsYou?: boolean;
  currentlyReadingBookId?: string;
}

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  description: string;
  genre: string;
  year: number;
  isbn: string;
  avgRating: number;
  reviewCount: number;
  coverTone: string;
  tags: string[];
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  createdAt: string;
  rating: number;
  text: string;
  featured?: boolean;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  bookId?: string;
  collectionId?: string;
  targetName?: string;
  rating?: number;
  excerpt?: string;
  timestamp: string;
}

export interface CollectionBook {
  bookId: string;
  readingStatus: ReadingStatus;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  visibility: CollectionVisibility;
  books: CollectionBook[];
}

export interface AuthorApplication {
  id: string;
  userId: string;
  userName: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  submittedAt: string;
}

export interface PaletteOption {
  id: string;
  name: string;
  description: string;
}
