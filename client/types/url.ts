export interface Url {
  id: string;
  originalUrl: string;
  slug: string;
  visits: number;
  createdAt: string;
  userId?: string;
  updatedAt?: string;
  visitsLog?: Visit[];
}

export interface CreateUrlDto {
  originalUrl: string;
  customSlug?: string;
  userId?: string;
}

export interface UpdateUrlDto {
  slug: string;
}

export interface Visit {
  id: string;
  visitedAt: string;
}
