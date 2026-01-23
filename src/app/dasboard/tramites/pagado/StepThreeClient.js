"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import {
  MoveLeft,
  CircleCheckBig,
  FileText,
  CalendarDays,
  User,
  Mail,
  Download,
  Copy,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/hooks/useAuth";

export default function StepThreeClient() {
  const router = useRouter();
  useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    cargarResumen();
    // Limpiar datos del flujo al completar
    return () => {
      // Limpiar después de un breve delay para permitir navegación
      setTimeout(() => {
        localStorage.removeItem("tramiteFormData");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("tramiteCost");
        localStorage.removeItem("currentRequisitos");
      }, 1000);
    };
  }, []);

  async function cargarResumen() {
    try {
      const applicationId = localStorage.getItem("applicationId");
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      // Cargar datos guardados como fallback
      const selectedTramite = JSON.parse(
        localStorage.getItem("selectedTramite") || "{}",
      );
      const formData = JSON.parse(
        localStorage.getItem("tramiteFormData") || "{}",
      );

      if (!applicationId) {
        throw new Error("No se encontró la solicitud");
      }

      const response = await fetch(
        `/api/applications/${applicationId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al cargar resumen del backend");
      }

      const data = await response.json();

      // El backend NO envía datos de usuario, usar localStorage
      const firstName = localStorage.getItem("firstName") || "";
      const lastName = localStorage.getItem("lastName") || "";
      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : localStorage.getItem("fullName") ||
            localStorage.getItem("userName") ||
            "Usuario";

      // Usar code en lugar de id
      const code =
        data.application?.code ||
        `TR-${String(data.application?.id || applicationId).padStart(6, "0")}`;

      setSummary({
        applicationNumber: code,
        procedureName:
          data.application?.procedure ||
          selectedTramite.name ||
          selectedTramite.nombre ||
          "Trámite Municipal",
        createdAt: data.application?.date
          ? new Date(data.application.date).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : new Date().toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
        userName: fullName,
        firstName: firstName,
        lastName: lastName,
        userEmail: email || "",
        cost:
          data.pay?.amount ||
          selectedTramite.cost ||
          selectedTramite.precio ||
          0,
        status: data.application?.status || "EN_PROCESO",
        formData: data.form || formData,
      });
    } catch (err) {
      console.error("Error al cargar resumen:", err);
      setError(err.message);

      // Usar datos de localStorage como fallback completo
      const email = localStorage.getItem("email");
      const applicationId = localStorage.getItem("applicationId");
      const selectedTramite = JSON.parse(
        localStorage.getItem("selectedTramite") || "{}",
      );
      const formData = JSON.parse(
        localStorage.getItem("tramiteFormData") || "{}",
      );

      setSummary({
        applicationNumber: applicationId || "TRM-" + Date.now(),
        procedureName:
          selectedTramite.name || selectedTramite.nombre || "Trámite Municipal",
        createdAt: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        userName: localStorage.getItem("userName") || "Usuario",
        firstName: "",
        lastName: "",
        userEmail: email || "",
        cost: selectedTramite.cost || selectedTramite.precio || 0,
        status: "REGISTRADO",
        formData: formData,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCopyNumber = async () => {
    if (summary?.applicationNumber) {
      try {
        await navigator.clipboard.writeText(summary.applicationNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error al copiar:", err);
      }
    }
  };

  const handleDescargarComprobante = async () => {
    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.innerHTML = `
      <div style="padding: 30px; font-family: Arial, sans-serif; color: #333; background: white; width: 800px;">
        <div style="text-align: center; border-bottom: 3px solid #0b3a77; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #0b3a77; margin: 0; font-size: 28px;">COMPROBANTE DE TRÁMITE</h2>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">Municipalidad Distrital de Ate</p>
        </div>
        
        <div style="background: #f8f9fa; border: 2px solid #0b3a77; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 11px; text-transform: uppercase;">Número de Trámite</p>
          <p style="margin: 0; color: #0b3a77; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${summary?.applicationNumber}</p>
        </div>

        <div style="margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #0b3a77; font-size: 14px; margin: 0 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Información del Trámite</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">TIPO DE TRÁMITE</p>
              <p style="color: #333; margin: 0; font-weight: bold;">${summary?.procedureName}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">FECHA DE REGISTRO</p>
              <p style="color: #333; margin: 0; font-weight: bold;">${summary?.createdAt}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">ESTADO</p>
              <p style="color: #27ae60; margin: 0; font-weight: bold;">✓ ${(summary?.status || "REGISTRADO").replace(/_/g, " ")}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">COSTO</p>
              <p style="color: #0b3a77; margin: 0; font-weight: bold; font-size: 16px;">S/ ${summary?.cost?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #0b3a77; font-size: 14px; margin: 0 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Solicitante</h3>
          
          <div style="font-size: 13px;">
            <div style="margin-bottom: 10px;">
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">NOMBRE COMPLETO</p>
              <p style="color: #333; margin: 0;">${summary?.userName}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">CORREO ELECTRÓNICO</p>
              <p style="color: #333; margin: 0;">${summary?.userEmail}</p>
            </div>
          </div>
        </div>

        ${
          summary?.formData?.direccion_propiedad
            ? `
          <div style="margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
            <h3 style="color: #0b3a77; font-size: 14px; margin: 0 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Datos de la Propiedad</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
              <div>
                <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">DIRECCIÓN</p>
                <p style="color: #333; margin: 0;">${summary.formData.direccion_propiedad}</p>
              </div>
              ${
                summary.formData.area_m2
                  ? `
                <div>
                  <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">ÁREA</p>
                  <p style="color: #333; margin: 0;">${summary.formData.area_m2} m²</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `
            : ""
        }

        <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center; margin-top: 30px; border-top: 2px solid #ddd; padding-top: 20px;">
          <p style="margin: 0; font-size: 11px; color: #666;">
            <strong>Fecha y Hora de Descarga:</strong> ${new Date().toLocaleString("es-ES")}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 10px; color: #999;">
            Este documento fue generado automáticamente. Guarda una copia para tu registro.
          </p>
        </div>
      </div>
    `;

      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#fff",
        logging: false,
        useCORS: true,
      });

      document.body.removeChild(element);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `Comprobante_Tramite_${summary?.applicationNumber || "TRM"}.pdf`,
      );
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al descargar el comprobante. Por favor, intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-black/50">Cargando resumen...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />

      <section className="mx-auto max-w-[1120px] px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            aria-label="Atrás"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-[10px] bg-transparent text-black/80 hover:bg-black/5 flex items-center justify-center cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
          >
            <MoveLeft />
          </button>

          <h1 className="text-[34px] font-semibold text-black">
            Nuevo trámite
          </h1>
        </div>

        <nav aria-label="Progreso" className="mb-6">
          <ol className="relative inline-flex items-center gap-10 px-12">
            <div
              className="absolute left-[52px] right-[52px] top-1/2 -translate-y-1/2 h-[2px] bg-black/10"
              aria-hidden="true"
            />
            <li className="relative z-10">
              <span className="h-12 w-12 rounded-full bg-[#dcdcdc] text-black/70 flex items-center justify-center font-semibold border border-black/10">
                1
              </span>
            </li>
            <li className="relative z-10">
              <span className="h-12 w-12 rounded-full bg-[#dcdcdc] text-black/70 flex items-center justify-center font-semibold border border-black/10">
                2
              </span>
            </li>
            <li className="relative z-10">
              <span className="h-12 w-12 rounded-full bg-[#0b3a77] text-white flex items-center justify-center font-semibold shadow">
                3
              </span>
            </li>
          </ol>
        </nav>

        <div className="mx-auto max-w-[980px] rounded-[10px] bg-[#e1e1e1] border border-black/20 shadow-[0_10px_18px_rgba(0,0,0,0.25)] px-8 py-7">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-200/60 flex items-center justify-center">
              <CircleCheckBig className="h-6 w-6 text-green-600" />
            </div>

            <h2 className="mt-3 text-[16px] font-semibold text-black">
              ¡Trámite Registrado Exitosamente!
            </h2>
            <p className="text-[12px] text-black/50">
              Tu solicitud ha sido recibida y está en proceso
            </p>
          </div>

          <div className="rounded-[8px] border border-[#0b3a77]/60 bg-[#d8e7ff]/25 px-6 py-5 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[12px] text-black/40">Número de Trámite</p>
                <p className="mt-2 text-[24px] md:text-[30px] font-extrabold tracking-wide text-[#0b3a77] break-all">
                  {summary?.applicationNumber || "PROCESANDO..."}
                </p>
                <p className="mt-1 text-[11px] text-black/40">
                  Guarda este número para consultar el estado
                </p>
              </div>
              <button
                onClick={handleCopyNumber}
                className="mt-2 p-2 rounded-md hover:bg-[#0b3a77]/10 transition-colors cursor-pointer scale-100 active:scale-95 ease-in-out"
                title="Copiar número"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-[#0b3a77]" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[13px] font-semibold text-black mb-3">
              Detalles del Trámite
            </h3>

            <div className="rounded-[8px] border border-black/10 bg-[#dcdcdc] px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#0b3a77]" />
                <div>
                  <p className="text-[11px] text-black/40">Tipo</p>
                  <p className="text-[13px] font-semibold text-black">
                    {summary?.procedureName || "---"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-[#0b3a77]" />
                <div>
                  <p className="text-[11px] text-black/40">Fecha de Registro</p>
                  <p className="text-[13px] font-semibold text-black">
                    {summary?.createdAt || "---"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[#0b3a77]" />
                <div>
                  <p className="text-[11px] text-black/40">Solicitante</p>
                  <p className="text-[13px] font-semibold text-black">
                    {summary?.userName || "---"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#0b3a77]" />
                <div>
                  <p className="text-[11px] text-black/40">Contacto</p>
                  <p className="text-[13px] font-semibold text-black">
                    {summary?.userEmail || "---"}
                  </p>
                </div>
              </div>

              {/* Mostrar datos del formulario si existen */}
              {summary?.formData?.direccion_propiedad && (
                <div className="pt-3 mt-3 border-t border-black/10">
                  <p className="text-[11px] font-semibold text-black/60 mb-2">
                    Datos de la Propiedad:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-black/40">Dirección</p>
                      <p className="text-[12px] text-black">
                        {summary.formData.direccion_propiedad}
                      </p>
                    </div>
                    {summary.formData.area_m2 && (
                      <div>
                        <p className="text-[10px] text-black/40">Área</p>
                        <p className="text-[12px] text-black">
                          {summary.formData.area_m2} m²
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#0b3a77]/60 bg-[#d8e7ff]/25 px-6 py-5 mb-7">
            <h3 className="text-[13px] font-semibold text-black mb-2">
              Próximos Pasos:
            </h3>
            <ol className="list-decimal pl-5 text-[12px] text-black/50 space-y-1">
              <li>
                Recibirás un correo de confirmación en los próximos 5 minutos
              </li>
              <li>
                El análisis de tu solicitud puede tomar 5 a 10 días hábiles
              </li>
              <li>Recibirás notificaciones del estado en tu email</li>
              <li>Consulta tu estado usando el número de trámite</li>
            </ol>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="h-[34px] flex-1 rounded-md border border-black/10 bg-[#e6e6e6] text-[12px] font-semibold text-black/90 flex items-center justify-center gap-2 cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
              onClick={() => handleDescargarComprobante()}
            >
              <Download className="h-4 w-4" />
              Descargar Comprobante
            </button>

            <button
              type="button"
              onClick={() => {
                // Limpiar todos los datos del trámite
                localStorage.removeItem("applicationId");
                localStorage.removeItem("tramiteFormData");
                localStorage.removeItem("paymentMethod");
                localStorage.removeItem("tramiteCost");
                localStorage.removeItem("currentRequisitos");
                localStorage.removeItem("currentApplicationId");

                router.push("/dasboard");
              }}
              className="h-[34px] flex-1 rounded-md bg-[#0b3a77] text-white text-[12px] font-semibold shadow-[0_3px_0_rgba(0,0,0,0.18)] hover:brightness-95 cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
