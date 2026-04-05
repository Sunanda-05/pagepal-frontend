export interface GenreOption {
  value: string;
  label: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  { value: "FICTION", label: "Fiction" },
  { value: "NON_FICTION", label: "Non Fiction" },
  { value: "FANTASY", label: "Fantasy" },
  { value: "SCIENCE_FICTION", label: "Science Fiction" },
  { value: "ROMANCE", label: "Romance" },
  { value: "MYSTERY", label: "Mystery" },
  { value: "THRILLER", label: "Thriller" },
  { value: "BIOGRAPHY", label: "Biography" },
  { value: "HISTORICAL_FICTION", label: "Historical Fiction" },
  { value: "YOUNG_ADULT", label: "Young Adult" },
  { value: "HORROR", label: "Horror" },
  { value: "SELF_HELP", label: "Self Help" },
  { value: "POETRY", label: "Poetry" },
  { value: "CLASSICS", label: "Classics" },
];

const GENRE_VALUE_SET = new Set(GENRE_OPTIONS.map((item) => item.value));

export function toGenreLabel(value: string): string {
  const matched = GENRE_OPTIONS.find((item) => item.value === value);
  if (matched) return matched.label;
  return value.replaceAll("_", " ");
}

export function normalizeGenreValue(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function isValidGenreValue(value: string): boolean {
  return GENRE_VALUE_SET.has(value);
}

export function findGenreValueByLabel(label: string): string | null {
  const normalized = label.trim().toLowerCase();
  const matched = GENRE_OPTIONS.find((item) => item.label.toLowerCase() === normalized);
  return matched?.value ?? null;
}
