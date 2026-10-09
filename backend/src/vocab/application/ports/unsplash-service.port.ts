export interface UnsplashImageResult {
  id: string;
  thumbUrl: string;
  regularUrl: string;
  altDescription: string | null;
  photographerName: string;
  photographerUrl: string;
}

export interface UnsplashSearchResult {
  results: UnsplashImageResult[];
  total: number;
  totalPages: number;
}

export interface UnsplashServicePort {
  searchPhotos(query: string, page?: number, perPage?: number): Promise<UnsplashSearchResult>;
}
