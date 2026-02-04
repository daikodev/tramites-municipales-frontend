import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization");

    const response = await fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al crear solicitud" },
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

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Token no proporcionado" },
        { status: 401 }
      );
    }

    console.log('Proxy GET /api/applications recibió Authorization:', authHeader?.substring(0, 50) + '...');

    const response = await fetch(`${API_URL}/applications`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();
    
    console.log('Backend respondió con status:', response.status);
    console.log('Backend data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || `Error ${response.status} al obtener solicitudes` },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error en proxy GET /api/applications:', error);
    return NextResponse.json(
      { message: `Error del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
