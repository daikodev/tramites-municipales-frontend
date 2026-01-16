import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function DELETE(req, { params }) {
  try {
    const { id, fileId } = await params;
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado: debes iniciar sesión" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/applications/${id}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.message || "Error al eliminar archivo" },
        { status: response.status }
      );
    }

    // Algunas APIs no devuelven contenido en DELETE
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
