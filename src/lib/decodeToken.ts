import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string | number;
  role: string;
  mobileNumber?: string;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
