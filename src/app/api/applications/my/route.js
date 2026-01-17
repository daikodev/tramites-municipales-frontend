import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function translateStatus(status) {
  const statusMap = {
    'BORRADOR': 'Pendiente',
    'ENVIADO': 'En proceso',
    'PAGADO': 'En proceso',
    'EN_REVISION': 'En proceso',
    'OBSERVADO': 'Pendiente',
    'APROBADO': 'Completado',
    'RECHAZADO': 'Rechazado'
  };
  return statusMap[status] || 'Pendiente';
}

export async function GET(req) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado: debes iniciar sesión" },
        { status: 401 }
      );
    }

    // Obtener userId de los query params si existe
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Construir URL con query params si hay userId
    const url = userId 
      ? `${API_URL}/applications/my?userId=${userId}`
      : `${API_URL}/applications/my`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    });

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al obtener historial" },
        { status: response.status }
      );
    }

    // Transformar datos al formato español esperado por el frontend
    const transformedData = (Array.isArray(data) ? data : []).map(tramite => ({
      id: tramite.applicationId || tramite.id || tramite.idsolicitud,
      numero: tramite.applicationId?.toString() || tramite.id?.toString() || tramite.idsolicitud?.toString() || 'N/A',
      tipo: tramite.procedureName || tramite.procedure?.name || 'Trámite',
      estado: translateStatus(tramite.status),
      descripcion: tramite.procedure?.description || tramite.description || 'Sin descripción',
      fechaSolicitud: formatDate(tramite.createAt || tramite.createdAt || tramite.applicationDate),
      fechaActualizacion: formatDate(tramite.updateAt || tramite.updatedAt),
      categoria: tramite.procedure?.category || 'General',
      // Mantener datos originales por si se necesitan
      _original: tramite
    }));

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
