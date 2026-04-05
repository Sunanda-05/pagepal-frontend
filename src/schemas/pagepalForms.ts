import { z } from "zod";
import { isValidGenreValue, normalizeGenreValue } from "@/data/genres";

export const reviewFormSchema = z.object({
  rating: z.number().min(0, "Rating cannot be negative").max(5, "Rating must be at most 5"),
  text: z
    .string()
    .min(10, "Review should be at least 10 characters")
    .max(1500, "Review should stay under 1500 characters"),
});

export const profileEditSchema = z.object({
  name: z.string().min(2, "Name is required").max(60, "Name should be under 60 characters"),
  bio: z
    .string()
    .min(0)
    .max(160, "Bio should stay under 160 characters"),
});

export const bookFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(120, "Title is too long"),
  description: z
    .string()
    .min(20, "Description should be at least 20 characters")
    .max(2500, "Description should stay under 2500 characters"),
  genre: z
    .string()
    .min(2, "Genre is required")
    .transform((value) => normalizeGenreValue(value))
    .refine((value) => isValidGenreValue(value), "Select a genre from the list"),
  publishedYear: z.number().min(1450).max(2100),
  isbn: z
    .string()
    .regex(/^(\d{10}|\d{13})$/, "Use a 10 or 13 digit ISBN"),
  coverColor: z.string().min(4).max(32).optional(),
});

export const collectionFormSchema = z.object({
  name: z.string().min(2, "Collection name is required").max(80, "Name too long"),
  description: z.string().min(0).max(280, "Description too long"),
  isPublic: z.boolean(),
});

export const authorApplySchema = z.object({
  bio: z
    .string()
    .min(50, "Tell us more about your writing motivations")
    .max(1500, "Keep motivation under 1500 characters"),
  writingHistory: z.string().max(1200, "Keep writing history under 1200 characters").optional(),
});

export const adminRejectSchema = z.object({
  reason: z
    .string()
    .min(8, "Please include a concise reason")
    .max(400, "Reason should stay under 400 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
export type ProfileEditValues = z.infer<typeof profileEditSchema>;
export type BookFormValues = z.infer<typeof bookFormSchema>;
export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
export type AuthorApplyValues = z.infer<typeof authorApplySchema>;
export type AdminRejectValues = z.infer<typeof adminRejectSchema>;
