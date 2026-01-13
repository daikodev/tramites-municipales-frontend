import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization");

    const response = await fetch(`${API_URL}/applications/${id}/history`, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al obtener historial" },
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
