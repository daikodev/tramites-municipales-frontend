"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";

export default function NuevoTramiteClient() {
  const router = useRouter();
  useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    direccion_propiedad: "",
    area_m2: "",
  });

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const savedFormData = localStorage.getItem("tramiteFormData");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (error) {
        console.error("Error al cargar formulario guardado:", error);
      }
    }
  }, []);

  // Permitir números decimales: acepta dígitos y un único punto decimal
  function sanitizeDecimalInput(value) {
    if (typeof value !== "string") return "";
    // Permitir solo números y un punto decimal
    let sanitized = value.replace(/[^0-9.]/g, "");
    // Asegurar que solo haya un punto decimal
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    return sanitized;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const newValue = name === "area_m2" ? sanitizeDecimalInput(value) : value;
    const newData = { ...formData, [name]: newValue };
    setFormData(newData);
    // Guardar en localStorage para persistencia
    localStorage.setItem("tramiteFormData", JSON.stringify(newData));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationId = localStorage.getItem("applicationId");
      const token = localStorage.getItem("token");

      if (!applicationId) {
        alert("No se encontró la solicitud. Por favor, reinicia el proceso.");
        router.push("/dasboard");
        return;
      }

      // Validar que el área sea un número válido (puede ser decimal)
      const areaNum = parseFloat(formData.area_m2);
      if (isNaN(areaNum) || areaNum <= 0) {
        throw new Error("Ingrese un área válida en m².");
      }

      const response = await fetch(`/api/applications/${applicationId}/form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fields: [
            {
              field: "direccion_propiedad",
              value: formData.direccion_propiedad,
            },
            {
              field: "area_m2",
              value: String(areaNum),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al guardar formulario");
      }

      const submitResponse = await fetch(
        `/api/applications/${applicationId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al enviar solicitud");
      }

      // Limpiar datos guardados después del éxito
      localStorage.removeItem("tramiteFormData");
      router.push("/dasboard/tramites/pago");
    } catch (error) {
      console.error("Error al procesar formulario:", error);
      alert(
        error.message ||
          "Error al procesar el formulario. Por favor, intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
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
            className="h-10 w-10 rounded-[10px] bg-transparent text-black/80 hover:bg-black/5 flex items-center justify-center text-[24px] cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
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
              <span className="h-12 w-12 rounded-full bg-[#0b3a77] text-white flex items-center justify-center font-semibold shadow">
                1
              </span>
            </li>
            <li className="relative z-10">
              <span className="h-12 w-12 rounded-full bg-[#dcdcdc] text-black/70 flex items-center justify-center font-semibold border border-black/10">
                2
              </span>
            </li>
            <li className="relative z-10">
              <span className="h-12 w-12 rounded-full bg-[#dcdcdc] text-black/70 flex items-center justify-center font-semibold border border-black/10">
                3
              </span>
            </li>
          </ol>
        </nav>
        <div className="mx-auto max-w-[980px] rounded-[10px] bg-[#e1e1e1] border border-black/20 shadow-[0_10px_18px_rgba(0,0,0,0.25)] px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset>
              <legend className="sr-only">Datos del trámite</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[12px] font-medium text-black/80">
                    Dirección de la Propiedad *
                  </label>
                  <input
                    type="text"
                    name="direccion_propiedad"
                    value={formData.direccion_propiedad}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Jr. Libertad Mz. 12 Lt. 15"
                    className="h-[36px] w-full rounded-[4px] text-black/80 border border-black/25 bg-[#dcdcdc] px-3 text-[13px] outline-none focus:border-black/40 placeholder:text-black/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-black/80">
                    Área en m² *
                  </label>
                  <input
                    type="text"
                    name="area_m2"
                    value={formData.area_m2}
                    onChange={handleChange}
                    inputMode="numeric"
                    required
                    placeholder="Ej: 256"
                    className="h-[36px] w-full rounded-[4px] text-black/80 border border-black/25 bg-[#dcdcdc] px-3 text-[13px] outline-none focus:border-black/40 placeholder:text-black/40"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <label className="text-[12px] font-medium text-black/80">
                  Observaciones (opcional)
                </label>
                <textarea
                  name="descripcion"
                  rows={6}
                  placeholder="Agrega observaciones adicionales sobre el trámite"
                  className="w-full rounded-[4px] border text-black/80 border-black/25 bg-[#dcdcdc] px-3 py-3 text-[13px] outline-none focus:border-black/40 resize-none min-h-[140px] placeholder:text-black/40"
                />
              </div>
            </fieldset>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-[34px] w-[90px] rounded-md border border-black/10 bg-[#e6e6e6] text-[12px] font-semibold text-black/90 cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-[34px] flex-1 rounded-md bg-[#0b3a77] text-white text-[12px] font-semibold shadow-[0_3px_0_rgba(0,0,0,0.18)] hover:brightness-95 disabled:opacity-70 cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
              >
                {loading ? "Procesando..." : "Continuar al Pago"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
