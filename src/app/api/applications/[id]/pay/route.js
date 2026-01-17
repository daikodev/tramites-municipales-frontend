import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado: debes iniciar sesión" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/applications/${id}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al procesar pago" },
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
