import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { getAllAppointments, getAppointmentsByOperator, Appointment } from "../../../../lib/dataStore";

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
  const format = searchParams.get("format") || "csv";
  const operatorKey = searchParams.get("operatorKey");

  let appointments: Appointment[];
  if (user.role === "superadmin") {
    appointments = operatorKey
      ? await getAppointmentsByOperator(operatorKey)
      : await getAllAppointments();
  } else {
    appointments = await getAppointmentsByOperator(user.employeeKey);
  }

  // Sort
  appointments.sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    return dc !== 0 ? dc : a.time.localeCompare(b.time);
  });

  if (format === "csv") {
    const headers = [
      "ID",
      "Operatore",
      "Cliente",
      "Telefono",
      "Email",
      "Data",
      "Ora",
      "Durata (min)",
      "Stato",
      "Note",
      "Creato",
    ];
    const rows = appointments.map((a) => [
      a.id,
      a.operatorKey,
      `"${a.clientName.replace(/"/g, '""')}"`,
      a.clientPhone,
      a.clientEmail || "",
      a.date,
      a.time,
      a.duration.toString(),
      a.status,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
      a.createdAt,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="appuntamenti-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // JSON format
  return new NextResponse(JSON.stringify(appointments, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="appuntamenti-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
