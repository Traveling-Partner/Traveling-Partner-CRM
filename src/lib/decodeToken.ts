import { jwtDecode } from "jwt-decode";
import { pickResolvedRole, rolesFromUnknown } from "@/lib/rbac";

export interface DecodedToken {
  id: string | number;
  role: string;
  name?: string;
  mobileNumber?: string;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const raw = jwtDecode<Record<string, unknown>>(token);
    const id = raw.id ?? raw.userId ?? raw.sub;
    if (id == null || typeof raw.exp !== "number") return null;
    return {
      id: id as string | number,
      role: pickResolvedRole([
        ...rolesFromUnknown(raw.role),
        ...rolesFromUnknown(raw.roles),
        ...rolesFromUnknown(raw.authorities)
      ]),
      name: readPersonName(raw.name, raw.fullName, raw.userName, raw.username),
      mobileNumber: typeof raw.mobileNumber === "string" ? raw.mobileNumber : undefined,
      exp: raw.exp
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

function readPersonName(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || /^\d{8,}$/.test(trimmed.replace(/[\s()+-]/g, ""))) continue;
    return trimmed;
  }
  return undefined;
}
