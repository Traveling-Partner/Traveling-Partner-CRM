import { apiUrl } from "@/lib/api-base";
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
  const response = await fetcher<GenerateOtpResponse>(apiUrl("/auth/admin/generate/otp"), {
    method: "POST",
    body: JSON.stringify({ mobileNumber }),
    debugLabel: "auth:generate-otp"
  });
  return response;
}

export async function loginUser({ mobileNumber, otp }: LoginPayload) {
  const response = await fetcher<LoginResponse>(apiUrl("/auth/admin/login"), {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp }),
    debugLabel: "auth:login"
  });

  return response.data;
}
