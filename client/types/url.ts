export interface Url {
    id: string;
    originalUrl: string;
    slug: string;
    visits: number;
    createdAt: string;
    userId?: string;
    updatedAt?: string;
}

export interface CreateUrlDto {
    originalUrl: string;
    customSlug?: string;
    userId?: string;  // Added to match backend
}

export interface UpdateUrlDto {
    slug: string;
}