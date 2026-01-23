"use client";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import TramiteCard from "@/components/dashboard/TramiteCard";
import InfoPanel from "@/components/dashboard/InfoPanel";
import Modal from "@/components/ui/Modal";
import TramiteTypeSelector from "@/components/tramites/TramiteTypeSelector";
import FileUploadModal from "@/components/tramites/FileUpLoadModal";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  useAuth();
  const [modalStep, setModalStep] = useState(null);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalStep === "select") {
      cargarTramites();
    }
  }, [modalStep]);

  async function cargarTramites() {
    try {
      setLoading(true);
      const response = await fetch("/api/procedures");
      const data = await response.json();

      if (response.ok) {
        setTramites(data);
      } else {
        console.error("Error al cargar trámites:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setModalStep(null);
    setSelectedTramite(null);
  }

  function handleVerHistorial() {
    router.push("/dasboard/tramites/historial");
  }

  async function handleSelectTramite(tramite) {
    try {
      // Limpiar estado anterior antes de iniciar un nuevo trámite
      localStorage.removeItem("applicationId");
      localStorage.removeItem("currentRequisitos");
      localStorage.removeItem("uploadProgress");
      localStorage.removeItem("tramiteFormData");

      setSelectedTramite(tramite);
      // Guardar información del trámite seleccionado
      localStorage.setItem("selectedTramite", JSON.stringify(tramite));
      localStorage.setItem("tramiteCost", tramite.cost || tramite.precio || 0);
      setModalStep("upload");
    } catch (error) {
      console.error("Error al seleccionar trámite:", error);
    }
  }

  function handleBackToSelection() {
    setModalStep("select");
    setSelectedTramite(null);
  }

  function handleContinueUpload(files) {
    setModalStep(null);
    setSelectedTramite(null);
  }

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />

      <div className="mx-auto max-w-[1120px] px-8 py-8">
        <section className="mb-10">
          <WelcomeBanner />
        </section>

        <section className="mb-12">
          <h2 className="text-[28px] font-bold text-black mb-10">Trámites</h2>

          <div
            className="
            grid grid-cols-1
            md:grid-cols-[repeat(2,200px)]
            gap-x-12 gap-y-10
            md:justify-center
            justify-items-center
            "
          >
            <TramiteCard
              icon="plus"
              active
              title="Realizar Trámite"
              subtitle="Inicia un nuevo trámite municipal"
              ctaText="Comenzar"
              onClick={() => setModalStep("select")}
            />
            <TramiteCard
              icon="clock"
              active
              title="Ver mis Trámites"
              subtitle="Consulta el estado de tus trámites"
              ctaText="Ver Historial"
              onClick={handleVerHistorial}
            />
          </div>
        </section>

        <section>
          <InfoPanel />
        </section>

        <Modal
          isOpen={modalStep === "select"}
          onClose={closeModal}
          title="Seleccionar Tipo de Trámite"
        >
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-black/50">Cargando trámites...</p>
            </div>
          ) : (
            <TramiteTypeSelector
              tramites={tramites}
              onSelect={handleSelectTramite}
            />
          )}
        </Modal>

        <Modal
          isOpen={modalStep === "upload"}
          onClose={closeModal}
          title="Subir Archivos"
        >
          <FileUploadModal
            tramite={selectedTramite}
            onBack={handleBackToSelection}
            onContinue={handleContinueUpload}
          />
        </Modal>
      </div>
    </main>
  );
}
