import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import {
  getAllAppointments,
  getAppointmentsByOperator,
  createAppointment,
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
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const status = searchParams.get("status");

  let appointments;
  if (user.role === "superadmin") {
    appointments = operatorKey
      ? await getAppointmentsByOperator(operatorKey)
      : await getAllAppointments();
  } else {
    appointments = await getAppointmentsByOperator(user.employeeKey);
  }

  // Apply filters
  if (dateFrom) {
    appointments = appointments.filter((a) => a.date >= dateFrom);
  }
  if (dateTo) {
    appointments = appointments.filter((a) => a.date <= dateTo);
  }
  if (status) {
    appointments = appointments.filter((a) => a.status === status);
  }

  // Sort by date and time
  appointments.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operatorKey, clientName, clientPhone, clientEmail, date, time, duration, status: aptStatus, notes } = body;

    // Employees can only create appointments for themselves
    const targetOperator = user.role === "superadmin" && operatorKey ? operatorKey : user.employeeKey;

    if (!clientName || !date || !time) {
      return NextResponse.json(
        { error: "Nome cliente, data e ora sono obbligatori" },
        { status: 400 }
      );
    }

    const appointment = await createAppointment({
      operatorKey: targetOperator,
      clientName,
      clientPhone: clientPhone || "",
      clientEmail: clientEmail || "",
      date,
      time,
      duration: duration || 60,
      status: aptStatus || "confirmed",
      notes: notes || "",
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Errore nella creazione dell'appuntamento" },
      { status: 500 }
    );
  }
}
