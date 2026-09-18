interface UnsplashPhoto {
  id: string;
  urls?: {
    thumb?: string | null;
    small?: string | null;
    regular?: string | null;
  };
  altDescription?: string | null;
  description?: string | null;
  user?: {
    name?: string | null;
    profileUrl?: string | null;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  totalPages: number;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isOptionalString = (value: unknown): value is string | null | undefined =>
  value === undefined || value === null || typeof value === 'string';

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const parseUrls = (value: unknown): UnsplashPhoto['urls'] | null => {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;
  const { thumb, small, regular } = value;
  if (!isOptionalString(thumb) || !isOptionalString(small) || !isOptionalString(regular)) {
    return null;
  }

  return {
    thumb,
    small,
    regular,
  };
};

const parseUser = (value: unknown): UnsplashPhoto['user'] | null => {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;
  const { name, links } = value;
  if (!isOptionalString(name)) return null;
  if (links === undefined) return { name };
  if (!isRecord(links) || !isOptionalString(links.html)) return null;

  return { name, profileUrl: links.html };
};

const parsePhoto = (value: unknown): UnsplashPhoto | null => {
  if (!isRecord(value) || typeof value.id !== 'string') return null;
  if (!isOptionalString(value.alt_description) || !isOptionalString(value.description)) {
    return null;
  }

  const urls = parseUrls(value.urls);
  const user = parseUser(value.user);
  if (urls === null || user === null) return null;

  return {
    id: value.id,
    urls,
    altDescription: value.alt_description,
    description: value.description,
    user,
  };
};

export const parseUnsplashSearchResponse = (value: unknown): UnsplashSearchResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.results)) return null;
  if (!isNonNegativeInteger(value.total) || !isNonNegativeInteger(value.total_pages)) return null;

  const results = value.results.map(parsePhoto);
  if (results.some((photo) => photo === null)) return null;

  return {
    results: results.filter((photo): photo is UnsplashPhoto => photo !== null),
    total: value.total,
    totalPages: value.total_pages,
  };
};
