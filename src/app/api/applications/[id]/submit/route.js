import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado: debes iniciar sesión" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/applications/${id}/submit`, {
      method: "POST",
      headers: {
        "Authorization": token,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al enviar solicitud" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
