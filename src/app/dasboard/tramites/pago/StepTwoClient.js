"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { MoveLeft, CreditCard, Wallet, Banknote } from "lucide-react";

export default function StepTwoClient() {
  const router = useRouter();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState(0);
  const [error, setError] = useState("");

  // Guardar método de pago seleccionado
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    localStorage.setItem('paymentMethod', newMethod);
  };

  useEffect(() => {
    // Validar que exista applicationId
    const applicationId = localStorage.getItem('applicationId');
    if (!applicationId) {
      setError('No se encontró la solicitud. Redirigiendo...');
      setTimeout(() => router.push('/dasboard'), 2000);
      return;
    }

    // Cargar el método de pago guardado si existe
    const savedMethod = localStorage.getItem('paymentMethod');
    if (savedMethod) {
      setMethod(savedMethod);
    }

    // Cargar el costo del trámite desde localStorage
    const savedCost = localStorage.getItem('tramiteCost');
    if (savedCost) {
      setCost(parseFloat(savedCost));
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const applicationId = localStorage.getItem('applicationId');
      const token = localStorage.getItem('token');

      if (!applicationId) {
        throw new Error('No se encontró la solicitud');
      }

      // Mapear los métodos de pago al formato del backend
      const paymentMethods = {
        "tarjeta": "card",
        "transferencia": "transfer",
        "efectivo": "cash"
      };

      const response = await fetch(`/api/applications/${applicationId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: cost,
          method: paymentMethods[method] || method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar pago');
      }

      router.push("/dasboard/tramites/pagado");
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setError(error.message);
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
            className="h-10 w-10 rounded-[10px] bg-transparent text-black/80 hover:bg-black/5 transition flex items-center justify-center"
          >
            <MoveLeft />
          </button>

          <h1 className="text-[34px] font-semibold text-black">Nuevo trámite</h1>
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
              <span className="h-12 w-12 rounded-full bg-[#0b3a77] text-white flex items-center justify-center font-semibold shadow">
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
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] bg-[#dcdcdc] border border-black/10 px-6 py-5 flex items-start justify-between gap-6">
              <div>
                <p className="text-[14px] font-semibold text-black">
                  Costo del trámite:
                </p>

                <ul className="mt-4 space-y-1 text-[12px] text-black/35 list-disc pl-4">
                  <li>Incluye procesamiento y tramitación</li>
                  <li>Válido por 12 meses desde la emisión</li>
                </ul>
              </div>

              <div className="text-right">
                <span className="text-[32px] font-semibold text-[#0b3a77]">
                  S/ {cost.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[14px] font-semibold text-black mb-3">
                Selecciona método de pago:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleMethodChange("tarjeta")}
                  className={`
                    w-full rounded-[10px] border px-6 py-4
                    flex items-center gap-4 text-left
                    transition
                    ${
                      method === "tarjeta"
                        ? "bg-[#dcdcdc] border-black/20 shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
                        : "bg-[#dcdcdc] border-black/10 hover:brightness-[0.99]"
                    }
                  `}
                >
                  <div
                    className={`h-10 w-10 rounded-[8px] flex items-center justify-center border ${
                      method === "tarjeta"
                        ? "bg-[#0b3a77] text-white border-[#0b3a77]"
                        : "bg-[#e6e6e6] text-black/60 border-black/10"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-black">
                      Tarjeta de Crédito/Débito
                    </p>
                    <p className="text-[11px] text-black/40">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange("transferencia")}
                  className={`
                    w-full rounded-[10px] border px-6 py-4
                    flex items-center gap-4 text-left
                    transition
                    ${
                      method === "transferencia"
                        ? "bg-[#dcdcdc] border-black/20 shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
                        : "bg-[#dcdcdc] border-black/10 hover:brightness-[0.99]"
                    }
                  `}
                >
                  <div
                    className={`h-10 w-10 rounded-[8px] flex items-center justify-center border ${
                      method === "transferencia"
                        ? "bg-[#0b3a77] text-white border-[#0b3a77]"
                        : "bg-[#e6e6e6] text-black/60 border-black/10"
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-black">
                      Transferencia Bancaria
                    </p>
                    <p className="text-[11px] text-black/40">
                      Depósito o transferencia a cuenta municipal
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange("efectivo")}
                  className={`
                    w-full rounded-[10px] border px-6 py-4
                    flex items-center gap-4 text-left
                    transition
                    ${
                      method === "efectivo"
                        ? "bg-[#dcdcdc] border-black/20 shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
                        : "bg-[#dcdcdc] border-black/10 hover:brightness-[0.99]"
                    }
                  `}
                >
                  <div
                    className={`h-10 w-10 rounded-[8px] flex items-center justify-center border ${
                      method === "efectivo"
                        ? "bg-[#0b3a77] text-white border-[#0b3a77]"
                        : "bg-[#e6e6e6] text-black/60 border-black/10"
                    }`}
                  >
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-black">
                      Pago en Efectivo
                    </p>
                    <p className="text-[11px] text-black/40">
                      Pago en caja de la municipalidad
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-[34px] w-[90px] rounded-[4px] border border-black/10 bg-[#e6e6e6] text-[12px] font-semibold text-black/90"
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-[34px] flex-1 rounded-[4px] bg-[#0b3a77] text-white text-[12px] font-semibold shadow-[0_3px_0_rgba(0,0,0,0.18)] hover:brightness-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando pago...' : 'Confirmar Pago'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
