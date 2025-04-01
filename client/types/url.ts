export interface Url {
    id: string;
    originalUrl: string;
    slug: string;
    createdAt: string;
    visits: number;
    userId?: string;
}

export interface CreateUrlDto {
    originalUrl: string;
    customSlug?: string;
}

export interface UpdateUrlDto {
    slug: string;
}
