import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token non valido" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      username: payload.username,
      employeeKey: payload.employeeKey,
      displayName: payload.displayName,
      role: payload.role,
    },
  });
}
