"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import TramiteTimeline from "@/components/tramites/TramiteTimeline";
import { ArrowLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/hooks/useAuth";

export default function DetalleTramitePage() {
  const router = useRouter();
  const { id } = useParams();
  useAuth();
  const [tramite, setTramite] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarDetalleTramite();
      cargarHistorial();
    }
  }, [id]);

  async function cargarDetalleTramite() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${id}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const applicationData = data.application || data;

        console.log("📊 Datos del summary:", data);
        console.log("📋 Application data:", applicationData);
        console.log("📅 Fechas recibidas:", {
          date: applicationData.date,
          createdAt: applicationData.createdAt,
          updatedAt: applicationData.updatedAt,
        });

        setTramite({
          id: applicationData.id,
          numero:
            applicationData.code ||
            `TR-${String(applicationData.id).padStart(6, "0")}`,
          tipo:
            applicationData.procedureName ||
            applicationData.procedure ||
            "Trámite Municipal",
          descripcion:
            applicationData.procedure?.description || "Trámite en proceso",
          estado: mapearEstado(applicationData.status),
          categoria: "Trámites Municipales",
          fechaSolicitud: formatearFecha(
            applicationData.date || applicationData.createdAt,
          ),
          fechaActualizacion: formatearFecha(
            applicationData.updatedAt || applicationData.date,
          ),
          informacionAdicional: obtenerInformacionAdicional(applicationData),
          ...applicationData,
        });
      } else if (response.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error al cargar detalle:", error);
    }
  }

  async function cargarHistorial() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${id}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📜 Historial recibido del API:", data);

        // Filtrar solo los estados relevantes para el ciudadano (excluir PAGADO)
        const estadosRelevantes = [
          "EN_REVISION",
          "OBSERVADO",
          "APROBADO",
          "RECHAZADO",
        ];

        const historialFiltrado = data
          .filter((item) => {
            const status = (item.currentStatus || item.status || "")
              .toString()
              .toUpperCase();
            return estadosRelevantes.includes(status);
          })
          .map((item, index, array) => {
            const status = item.currentStatus || item.status;
            const fecha = item.changedAt || item.createAt || item.createdAt;

            return {
              estado: mapearEstadoHistorial(status),
              fecha: formatearFechaLarga(fecha),
              descripcion: item.description || obtenerDescripcionEstado(status),
              isActive: index === array.length - 1, // El último es el actual
            };
          });

        // Siempre agregar el estado inicial "Trámite solicitado" al principio si hay historial
        if (data.length > 0) {
          // Buscar la fecha del estado PAGADO si existe, sino usar el primer registro
          const registroPagado = data.find(
            (item) =>
              (item.currentStatus || item.status || "")
                .toString()
                .toUpperCase() === "PAGADO",
          );
          const fechaInicial = registroPagado
            ? registroPagado.changedAt ||
              registroPagado.createAt ||
              registroPagado.createdAt
            : data[0].changedAt || data[0].createAt || data[0].createdAt;

          historialFiltrado.unshift({
            estado: "Trámite solicitado",
            fecha: formatearFechaLarga(fechaInicial),
            descripcion:
              "Tu solicitud fue registrada exitosamente en el sistema",
            isActive: false,
          });
        }

        console.log("📋 Historial procesado:", historialFiltrado);
        setHistorial(historialFiltrado);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  }

  function mapearEstado(status) {
    if (!status) return "Desconocido";
    const statusUpper = status.toString().toUpperCase();
    const estados = {
      BORRADOR: "Borrador",
      ENVIADO: "Enviado",
      PAGADO: "En Proceso",
      EN_REVISION: "En Proceso",
      OBSERVADO: "En Proceso",
      APROBADO: "Completado",
      RECHAZADO: "Rechazado",
    };
    return estados[statusUpper] || status;
  }

  function mapearEstadoHistorial(status) {
    if (!status) return "Actualización";
    const statusUpper = status.toString().toUpperCase();
    const estados = {
      EN_REVISION: "En revisión",
      OBSERVADO: "Con observaciones",
      APROBADO: "Trámite aprobado",
      RECHAZADO: "Trámite rechazado",
    };
    return estados[statusUpper] || status;
  }

  function obtenerDescripcionEstado(status) {
    if (!status) return "Actualización del trámite";
    const statusUpper = status.toString().toUpperCase();
    const descripciones = {
      EN_REVISION:
        "Tu solicitud está siendo revisada por el área correspondiente",
      OBSERVADO: "Se han realizado observaciones que requieren tu atención",
      APROBADO:
        "Tu trámite ha sido aprobado exitosamente. Puedes recoger tu documento",
      RECHAZADO:
        "Tu solicitud fue rechazada. Contacta con la oficina para más información",
    };
    return descripciones[statusUpper] || "Actualización del trámite";
  }

  function obtenerInformacionAdicional(data) {
    const statusUpper = (data.status || "").toString().toUpperCase();
    if (statusUpper === "APROBADO") {
      return "Trámite aprobado exitosamente. Documento disponible para recoger.";
    } else if (statusUpper === "EN_REVISION" || statusUpper === "OBSERVADO") {
      return "Tu trámite está siendo procesado por la dependencia correspondiente.";
    } else if (statusUpper === "PAGADO") {
      return "El pago fue procesado. Tu trámite será revisado en breve.";
    } else if (statusUpper === "RECHAZADO") {
      return "Tu solicitud fue rechazada. Contacta con la oficina para más información.";
    }
    return "Trámite en proceso.";
  }

  function formatearFecha(fecha) {
    if (!fecha) return "N/A";
    try {
      let date;

      // Si la fecha viene solo como YYYY-MM-DD (sin hora), agregar hora local para evitar conversión de zona horaria
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        // Formato YYYY-MM-DD sin hora - agregar T00:00:00 en hora local
        date = new Date(fecha + "T00:00:00");
      } else {
        // Fecha con hora o formato diferente
        date = new Date(fecha);
      }

      // Verificamos que la fecha sea válida
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Lima",
      });
    } catch {
      return fecha;
    }
  }

  function formatearFechaLarga(fecha) {
    if (!fecha) return "N/A";
    try {
      let date;

      // Si la fecha viene solo como YYYY-MM-DD (sin hora), agregar hora local para evitar conversión de zona horaria
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        date = new Date(fecha + "T00:00:00");
      } else {
        date = new Date(fecha);
      }

      // Verificamos que la fecha sea válida
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
      });
    } catch {
      return fecha;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-12">
            <p className="text-black/50">Cargando detalles del trámite...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!tramite) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-12">
            <p className="text-black/50">No se encontró el trámite</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-blue-600 hover:underline"
            >
              Volver
            </button>
          </div>
        </section>
      </main>
    );
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Completado":
        return "text-green-700 bg-green-100";
      case "En Proceso":
      case "En proceso":
        return "text-orange-700 bg-orange-100";
      case "Rechazado":
        return "text-red-700 bg-red-100";
      default:
        return "text-black/60 bg-black/10";
    }
  };

  const handleDescargar = async () => {
    if (!tramite) return;

    try {
      const email = localStorage.getItem("email");
      const firstName = localStorage.getItem("firstName") || "";
      const lastName = localStorage.getItem("lastName") || "";
      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : localStorage.getItem("fullName") || "Usuario";

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
          <p style="margin: 0; color: #0b3a77; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${tramite.numero}</p>
        </div>

        <div style="margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #0b3a77; font-size: 14px; margin: 0 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Información del Trámite</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">TIPO DE TRÁMITE</p>
              <p style="color: #333; margin: 0; font-weight: bold;">${tramite.tipo}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">FECHA DE REGISTRO</p>
              <p style="color: #333; margin: 0; font-weight: bold;">${tramite.fechaSolicitud}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">ESTADO</p>
              <p style="color: #27ae60; margin: 0; font-weight: bold;">✓ ${tramite.estado}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">ÚLTIMA ACTUALIZACIÓN</p>
              <p style="color: #333; margin: 0; font-weight: bold;">${tramite.fechaActualizacion}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #0b3a77; font-size: 14px; margin: 0 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Solicitante</h3>
          
          <div style="font-size: 13px;">
            <div style="margin-bottom: 10px;">
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">NOMBRE COMPLETO</p>
              <p style="color: #333; margin: 0;">${fullName}</p>
            </div>
            <div>
              <p style="color: #999; margin: 0 0 5px 0; font-size: 11px; font-weight: bold;">CORREO ELECTRÓNICO</p>
              <p style="color: #333; margin: 0;">${email || "N/A"}</p>
            </div>
          </div>
        </div>

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

      pdf.save(`Comprobante_Tramite_${tramite.numero || tramite.id}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al descargar el comprobante. Por favor, intenta de nuevo.");
    }
  };

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />

      <section className="mx-auto max-w-[1120px] px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center h-10 w-10 rounded-[10px] text-black/80 hover:bg-black/5 cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
              aria-label="Atrás"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h1 className="text-[34px] font-semibold text-black">
              Detalles del trámite
            </h1>
          </div>

          <p className="ml-[52px] mt-1 text-[13px] text-black/45">
            Referencia: {tramite.numero}
          </p>
        </div>

        <section className="rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_10px_18px_rgba(0,0,0,0.20)] px-8 py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-semibold text-black">
                {tramite.tipo}
              </h2>
              <p className="mt-1 text-[12px] text-black/45">
                {tramite.descripcion}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getEstadoColor(
                tramite.estado,
              )}`}
            >
              {tramite.estado}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <p className="text-[11px] text-black/40">Número de trámite</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.numero}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Tipo</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.categoria}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Fecha de solicitud</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.fechaSolicitud}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Última actualización</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.fechaActualizacion}
              </p>
            </div>
          </div>

          <div className="my-6 h-[1px] w-full bg-black/10" />

          <div>
            <p className="text-[11px] text-black/40 mb-2">
              Información adicional
            </p>
            <div className="rounded-[8px] border border-black/10 bg-black/5 px-4 py-3 text-[12px] text-black/70">
              {tramite.informacionAdicional}
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleDescargar}
              className="h-[30px] px-4 rounded-md bg-[#0b3a77] text-white text-[12px] font-semibold flex items-center gap-2 hover:brightness-95 shadow-[0_3px_0_rgba(0,0,0,0.18)] cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
            >
              <Download className="h-4 w-4" />
              Descargar Comprobante
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_10px_18px_rgba(0,0,0,0.18)] px-8 py-6">
          <h2 className="text-[16px] font-semibold text-black mb-4">
            Historial del trámite
          </h2>

          <TramiteTimeline historial={historial} />
        </section>
      </section>
    </main>
  );
}
