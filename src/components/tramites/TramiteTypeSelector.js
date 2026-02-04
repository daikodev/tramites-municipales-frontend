"use client";

import { Settings, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function TramiteTypeSelector({ tramites = [], onSelect }) {
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [selectedTramite, setSelectedTramite] = useState(null);

  // Si no hay trámites, mostrar mensaje
  if (!tramites || tramites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-black/50">No hay trámites disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-black/40">
        Selecciona el tipo de trámite que deseas realizar:
      </p>

      <div className="space-y-3">
        {tramites.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              // Guardar el costo del trámite para usarlo en el pago
              localStorage.setItem("tramiteCost", t.cost || t.precio || 0);
              onSelect?.(t);
            }}
            className="
              w-full
              rounded-[10px]
              bg-[#ffff]
              border border-black/10
              px-5 py-6
              flex items-center justify-between gap-4
              hover:brightness-[0.98]
              transition
              shadow-[0_18px_40px_rgba(0,0,0,0.2)]
              cursor-pointer scale-100 active:scale-95 ease-in-out
            "
          >
            <div className="flex items-center gap-4">
              {/* <div className="h-12 w-12 rounded-[8px] bg-[#dcdcdc] border border-black/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-[#0b3a77]" />
              </div> */}

              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-black leading-snug">
                    {t.name || t.nombre}
                  </h3>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTramite(t);
                      setShowHelpPopup(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTramite(t);
                        setShowHelpPopup(true);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 transition flex-shrink-0 cursor-pointer"
                    title="Ver requisitos"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-[12px] text-black/35 leading-snug">
                  {t.description || t.descripcion}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[26px] font-semibold text-[#0b3a77]">
                S/ {parseFloat(t.cost || t.precio || 0).toFixed(2)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {showHelpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-lg font-semibold text-black mb-4">
              Requisitos para {selectedTramite?.name || selectedTramite?.nombre}
            </h2>
            <p className="text-sm text-black/70 leading-relaxed">
              Para realizar este trámite necesitas:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-black/70">
              <li>Documento de identidad válido</li>
              <li>Comprobante de domicilio</li>
              <li>Formulario completado</li>
            </ul>
            <p className="text-sm text-black/70 mt-3 leading-relaxed">
              Tiempo estimado para la tramitación es de una semana.
            </p>
            <button
              onClick={() => setShowHelpPopup(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
