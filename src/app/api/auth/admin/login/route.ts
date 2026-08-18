import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { success: false, message: "API base URL is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/auth/admin/login] upstream request failed", error);
    const reason = error instanceof Error ? error.message : String(error);
    const cause =
      error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    return NextResponse.json(
      { success: false, message: `Unable to process login request: ${reason}${cause}` },
      { status: 502 }
    );
  }
}
