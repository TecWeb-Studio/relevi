import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, generateToken } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password sono obbligatori" },
        { status: 400 }
      );
    }

    const user = verifyCredentials(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        employeeKey: user.employeeKey,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
