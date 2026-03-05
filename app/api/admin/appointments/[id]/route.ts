import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../lib/auth";
import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../../../../../lib/dataStore";

function authenticate(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getAppointmentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Appuntamento non trovato" }, { status: 404 });
  }

  // Employees can only edit their own appointments
  if (user.role !== "superadmin" && existing.operatorKey !== user.employeeKey) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = updateAppointment(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Aggiornamento fallito" }, { status: 500 });
    }
    return NextResponse.json({ appointment: updated });
  } catch {
    return NextResponse.json({ error: "Errore di aggiornamento" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getAppointmentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Appuntamento non trovato" }, { status: 404 });
  }

  if (user.role !== "superadmin" && existing.operatorKey !== user.employeeKey) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const deleted = deleteAppointment(id);
  if (!deleted) {
    return NextResponse.json({ error: "Eliminazione fallita" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
