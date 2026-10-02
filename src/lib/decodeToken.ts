import { jwtDecode } from "jwt-decode";
import { pickResolvedRole, rolesFromUnknown } from "@/lib/rbac";

export interface DecodedToken {
  id: string | number;
  role: string;
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
      mobileNumber: typeof raw.mobileNumber === "string" ? raw.mobileNumber : undefined,
      exp: raw.exp
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
