import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization");
    const formData = await req.formData();

    const response = await fetch(`${API_URL}/applications/${id}/files`, {
      method: "POST",
      headers: {
        "Authorization": token,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al subir archivo" },
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
