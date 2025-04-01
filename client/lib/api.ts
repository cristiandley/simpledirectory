import axios from "axios";
import type { Url, CreateUrlDto, UpdateUrlDto } from "@/types/url";
import variables from "../config/variables";

const api = axios.create({
  baseURL: variables.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const urlService = {
  createUrl: async (
    data: CreateUrlDto,
    userId?: string,
  ): Promise<{ url: Url; shortenedUrl: string }> => {
    const requestData = userId ? { ...data, userId } : data;
    const response = await api.post("/urls", requestData);
    return response.data;
  },
  getUrls: async (userId?: string): Promise<Url[]> => {
    const response = await api.get("/urls", {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },
  getUrlBySlug: async (slug: string): Promise<Url> => {
    const response = await api.get(`urls/${slug}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      params: {
        _: Date.now(),
      },
    });
    return response.data;
  },
  updateUrl: async (
    id: string,
    data: UpdateUrlDto,
    userId?: string,
  ): Promise<Url> => {
    const response = await api.put(`/urls/${id}`, data, {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },
  deleteUrl: async (id: string, userId?: string): Promise<void> => {
    await api.delete(`/urls/${id}`, {
      params: userId ? { userId } : undefined,
    });
  },
  getUrlVisits: async (id: string): Promise<{ visitedAt: string }[]> => {
    const response = await api.get(`/urls/${id}/visits`);
    return response.data;
  },
};

export default api;
