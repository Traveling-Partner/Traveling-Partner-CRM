import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string | number;
  role: string;
  mobileNumber?: string;
  exp: number;
}

function firstString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!Array.isArray(value)) return "";
  for (const item of value) {
    if (typeof item === "string" && item.trim()) return item.trim();
    if (item && typeof item === "object") {
      const authority = (item as { authority?: unknown }).authority;
      if (typeof authority === "string" && authority.trim()) return authority.trim();
    }
  }
  return "";
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const raw = jwtDecode<Record<string, unknown>>(token);
    const id = raw.id ?? raw.userId ?? raw.sub;
    if (id == null || typeof raw.exp !== "number") return null;
    return {
      id: id as string | number,
      role: firstString(raw.role) || firstString(raw.roles) || firstString(raw.authorities),
      mobileNumber: typeof raw.mobileNumber === "string" ? raw.mobileNumber : undefined,
      exp: raw.exp
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
