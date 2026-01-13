import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization");

    const response = await fetch(`${API_URL}/formats/${id}/download`, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Error al descargar archivo" },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
