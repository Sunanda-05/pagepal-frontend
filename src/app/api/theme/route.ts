import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { mode } = await request.json();
  console.log({ mode });
  
  const res = NextResponse.json({ success: true });
  res.cookies.set("mode", mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
