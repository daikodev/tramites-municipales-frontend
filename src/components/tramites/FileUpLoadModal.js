"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderDown, FolderUp, CheckCircle2, X } from "lucide-react";
import {
  saveUploadProgress,
  loadUploadProgress,
  clearUploadProgress,
} from "@/lib/tramiteState";

export default function FileUploadModal({ tramite, onBack, onContinue }) {
  const [files, setFiles] = useState({});
  const [requisitos, setRequisitos] = useState([]);
  const [uploading, setUploading] = useState({});
  const [uploaded, setUploaded] = useState({});
  const [uploadedFileIds, setUploadedFileIds] = useState({}); // Guardar el ID del archivo en el backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (tramite && !applicationId) {
      // Solo crear si no existe una solicitud activa
      console.log(
        "🚀 Iniciando nuevo trámite:",
        tramite.name || tramite.nombre,
      );
      iniciarTramite();
    }
  }, [tramite]);

  async function iniciarTramite() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error(
          "No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.",
        );
      }

      // 1. Crear la solicitud
      const createResponse = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          procedureId: tramite.id,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear la solicitud");
      }

      const applicationData = await createResponse.json();
      const newApplicationId = applicationData.id;

      console.log("✅ Solicitud creada con ID:", newApplicationId);

      setApplicationId(newApplicationId);
      localStorage.setItem("applicationId", newApplicationId);

      // 2. Cargar requisitos
      const reqResponse = await fetch(
        `/api/procedures/${tramite.id}/requisitos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!reqResponse.ok) {
        const errorData = await reqResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al cargar requisitos");
      }

      const reqData = await reqResponse.json();
      setRequisitos(reqData);
      localStorage.setItem("currentRequisitos", JSON.stringify(reqData));
    } catch (err) {
      console.error("Error al iniciar trámite:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(requirementId, file) {
    if (!file) return;

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      setError(
        `El archivo "${file.name}" debe ser un PDF. Por favor, convierte tu archivo a formato PDF antes de subirlo.`,
      );
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`El archivo "${file.name}" es muy grande. Tamaño máximo: 10MB`);
      return;
    }

    setFiles((prev) => ({ ...prev, [requirementId]: file }));

    // Subir automáticamente
    await handleUpload(requirementId, file);
  }

  async function handleUpload(requirementId, file) {
    if (!applicationId) {
      setError("No se encontró la solicitud");
      return;
    }

    // Verificar si ya hay una subida en progreso
    const isAnyUploading = Object.values(uploading).some(
      (status) => status === true,
    );
    if (isAnyUploading) {
      setError(
        "Por favor espera a que termine la subida actual antes de subir otro archivo",
      );
      // Limpiar el archivo seleccionado
      setFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[requirementId];
        return newFiles;
      });
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [requirementId]: true }));
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No autorizado: debes iniciar sesión");
      }

      const formData = new FormData();
      formData.append("requirementId", requirementId);
      formData.append("file", file);

      const response = await fetch(`/api/applications/${applicationId}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir archivo");
      }

      const responseData = await response.json();

      // Marcar como subido y guardar progreso con el ID del archivo
      const newUploaded = { ...uploaded, [requirementId]: true };
      setUploaded(newUploaded);
      setUploadedFileIds((prev) => ({
        ...prev,
        [requirementId]: responseData.id || responseData.fileId,
      }));
      saveUploadProgress(requirementId, true);
    } catch (err) {
      console.error("Error al subir archivo:", err);
      setError(`Error al subir archivo: ${err.message}`);
      setFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[requirementId];
        return newFiles;
      });
    } finally {
      setUploading((prev) => ({ ...prev, [requirementId]: false }));
    }
  }

  async function handleDeleteFile(requirementId) {
    if (!applicationId) {
      setError("No se encontró la solicitud");
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No autorizado: debes iniciar sesión");
      }

      const fileId = uploadedFileIds[requirementId];

      // Si tenemos el ID del archivo, intentar eliminarlo del backend
      if (fileId) {
        const response = await fetch(
          `/api/applications/${applicationId}/files/${fileId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn("No se pudo eliminar del backend:", errorData.message);
          // Continuar de todos modos para permitir resubir
        }
      }

      // Limpiar estados locales
      setUploaded((prev) => {
        const newUploaded = { ...prev };
        delete newUploaded[requirementId];
        return newUploaded;
      });

      setUploadedFileIds((prev) => {
        const newIds = { ...prev };
        delete newIds[requirementId];
        return newIds;
      });

      setFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[requirementId];
        return newFiles;
      });

      clearUploadProgress(requirementId);
    } catch (err) {
      console.error("Error al eliminar archivo:", err);
      setError(`Error al eliminar archivo: ${err.message}`);
    }
  }

  async function handleDescargarFormato(formatId, nombre) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/formats/${formatId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al descargar formato");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre || `formato-${formatId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error al descargar formato:", err);
      setError(`Error al descargar formato: ${err.message}`);
    }
  }

  function handleContinue() {
    // Verificar que todos los requisitos tengan archivo subido
    const requisitosSinArchivo = requisitos.filter((req) => !uploaded[req.id]);

    if (requisitosSinArchivo.length > 0) {
      setError("Debes subir todos los archivos requeridos antes de continuar");
      return;
    }

    router.push("/dasboard/tramites/nuevo");
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-black/50">Cargando requisitos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje informativo sobre PDF */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-[6px]">
        <p className="text-[13px] text-blue-800 font-medium flex items-center gap-2">
          <FolderUp className="h-4 w-4" />
          Importante: Todos los archivos deben estar en formato PDF
        </p>
        <p className="text-[12px] text-blue-700 mt-1">
          Tamaño máximo por archivo: 10MB
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] text-[14px] font-semibold text-black">
        <span>Requisitos</span>
        <span className="text-center">Formato</span>
        <span className="text-center">Cargar Archivo</span>
      </div>

      <div className="space-y-4">
        {requisitos.map((req) => {
          // Verificar si hay alguna subida en progreso
          const isAnyUploading = Object.values(uploading).some(
            (status) => status === true,
          );
          const isThisUploading = uploading[req.id];
          const isThisUploaded = uploaded[req.id];
          // Deshabilitar solo si está subiendo alguno
          const shouldDisable = isAnyUploading;

          return (
            <div
              key={req.id}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-x-6 text-[14px] pb-5 font-semibold text-black items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-black/40">
                  {req.name || req.nombre}
                </span>
                {isThisUploaded && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>

              <div className="flex justify-center">
                <label
                  className={`
                h-[30px] w-[120px]
                rounded-[4px]
                border border-black/10
                text-[12px] font-semibold
                flex items-center justify-center gap-2
                transition
                ${
                  uploading[req.id]
                    ? "bg-gray-300 text-black/40 cursor-not-allowed"
                    : uploaded[req.id]
                      ? "bg-green-100 text-green-700 border-green-300 cursor-pointer"
                      : "bg-[#e6e6e6] text-black/60 cursor-pointer hover:bg-[#d0d0d0]"
                }
              `}
                />
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={uploading[req.id]}
                  onChange={(e) =>
                    handleFileChange(req.id, e.target.files?.[0])
                  }
                />
                {uploading[req.id] ? (
                  "Subiendo..."
                ) : uploaded[req.id] ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Subido
                  </>
                ) : (
                  <span className="text-[11px] text-black/30">Sin formato</span>
                )}
              </div>

              <div className="flex justify-center items-center gap-2">
                <label
                  className={`
                  h-[30px] w-[120px]
                  rounded-[4px]
                  border border-black/10
                  text-[12px] font-semibold
                  flex items-center justify-center gap-2
                  transition
                  ${
                    shouldDisable
                      ? "bg-gray-300 text-black/40 cursor-not-allowed"
                      : "bg-[#e6e6e6] text-black/60 cursor-pointer hover:bg-[#d0d0d0]"
                  }
                  ${isThisUploaded && !isThisUploading && "bg-green-100 text-green-700 border-green-300"}
                `}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={shouldDisable}
                    onChange={(e) =>
                      handleFileChange(req.id, e.target.files?.[0])
                    }
                  />
                  {isThisUploading ? (
                    "Subiendo..."
                  ) : isThisUploaded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Subido
                    </>
                  ) : (
                    <>
                      <FolderUp className="h-4 w-4" />
                      Subir
                    </>
                  )}
                </label>

                {isThisUploaded && !isThisUploading && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(req.id)}
                    className="
                      h-[30px] w-[30px]
                      rounded-[4px]
                      border border-red-300
                      bg-red-50
                      text-red-600
                      flex items-center justify-center
                      hover:bg-red-100
                      transition
                    "
                    title="Eliminar archivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-20">
        <button
          type="button"
          onClick={onBack}
          className="h-[30px] w-[90px] rounded-[4px] border border-black/10 bg-[#e6e6e6] text-[12px] font-semibold text-black/60"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="h-[30px] flex-1 rounded-[4px] bg-[#0b3a77] text-white text-[12px] font-semibold shadow-[0_3px_0_rgba(0,0,0,0.18)]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
