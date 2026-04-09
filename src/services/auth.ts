import { fetcher } from "@/lib/fetcher";

interface LoginPayload {
  mobileNumber: string;
  otp: string;
}

interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    email: string | null;
    id: number;
    role: string;
    token: string;
  };
}

export async function loginUser({ mobileNumber, otp }: LoginPayload) {
  const response = await fetcher<LoginResponse>("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp })
  });

  return response.data;
}
