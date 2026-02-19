import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    );
  }
}
