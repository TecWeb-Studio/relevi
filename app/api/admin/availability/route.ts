import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import {
  getAvailabilityOverrides,
  setAvailabilityOverride,
  removeAvailabilityOverride,
  getOperatorSchedule,
  setOperatorSchedule,
} from "../../../../lib/dataStore";

function authenticate(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operatorKey");

  let overrides;
  let schedule = null;

  if (user.role === "superadmin") {
    overrides = await getAvailabilityOverrides(operatorKey || undefined);
    if (operatorKey) schedule = await getOperatorSchedule(operatorKey);
  } else {
    overrides = await getAvailabilityOverrides(user.employeeKey);
    schedule = await getOperatorSchedule(user.employeeKey);
  }

  return NextResponse.json({ overrides, schedule });
}

export async function POST(request: NextRequest) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operatorKey, date, available, timeSlots, reason } = body;

    const targetOperator =
      user.role === "superadmin" && operatorKey ? operatorKey : user.employeeKey;

    if (!date) {
      return NextResponse.json({ error: "Data obbligatoria" }, { status: 400 });
    }

    await setAvailabilityOverride({
      operatorKey: targetOperator,
      date,
      available: available ?? false,
      timeSlots,
      reason: reason || "",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operatorKey");
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Data obbligatoria" }, { status: 400 });
  }

  const targetOperator =
    user.role === "superadmin" && operatorKey ? operatorKey : user.employeeKey;

  const removed = await removeAvailabilityOverride(targetOperator, date);
  return NextResponse.json({ success: removed });
}

export async function PUT(request: NextRequest) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operatorKey, daysOfWeek, timeSlots, daySlots, sessionDuration, breakBetweenSessions } = body;

    const targetKey =
      user.role === "superadmin" && operatorKey ? operatorKey : user.employeeKey;

    if (!Array.isArray(daysOfWeek) || !Array.isArray(timeSlots)) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    await setOperatorSchedule({
      operatorKey: targetKey,
      daysOfWeek,
      timeSlots,
      daySlots: daySlots || undefined,
      sessionDuration: Number(sessionDuration) || 60,
      breakBetweenSessions: Number(breakBetweenSessions) || 15,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }
}
