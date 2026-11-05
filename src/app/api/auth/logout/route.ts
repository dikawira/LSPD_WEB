import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(request: Request) {
  await destroySession();
  const response = NextResponse.redirect(new URL("/login?logged_out=1", request.url));
  response.cookies.delete("lspd_oauth_state");
  return response;
}
