import apiClient from "./axios";

export interface AuthUser {
  id: number;
  nickname: string;
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const response = await apiClient.get<AuthUser>("/auth/me");
    return response.data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export function loginUrl(provider: "naver" | "kakao"): string {
  return `/api/oauth2/authorization/${provider}`;
}