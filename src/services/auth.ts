import { fetcher } from "@/lib/fetcher";

interface OtpPayload {
  mobileNumber: string;
}

interface LoginPayload {
  mobileNumber: string;
  otp: string;
}

interface GenerateOtpResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    name: string | null;
    email: string | null;
    id: number;
    role: string;
    token: string;
  };
}

export async function generateAdminOtp({ mobileNumber }: OtpPayload) {
  const response = await fetcher<GenerateOtpResponse>("/api/auth/admin/generate/otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber })
  });
  return response;
}

export async function loginUser({ mobileNumber, otp }: LoginPayload) {
  const response = await fetcher<LoginResponse>("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp })
  });

  console.log("[Auth] /auth/admin/login response:", response);

  return response.data;
}
