"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const initial = useMemo(() => {
    return email ? email.charAt(0).toUpperCase() : "A";
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("applicationId");
    localStorage.removeItem("currentRequisitos");
    localStorage.removeItem("currentApplicationId");
    localStorage.removeItem("userRole");
    router.push("/auth/login");
  };

  return (
    <header className="bg-[#0b63c7] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-md px-6 py-2">
            <Image
              src="/logo-muni.webp"
              alt="Municipalidad Distrital de Ate"
              width={300}
              height={300}
              className="w-[120px] h-auto"
            />
          </div>

          <div>
            <p className="text-[26px] font-semibold">Panel de Administración</p>
            <span className="text-[13px] opacity-80">
              Municipalidad de Ate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/18 border border-white/25 rounded-lg px-4 py-2">
          <span className="h-9 w-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-semibold">
            {initial}
          </span>
          <span className="text-sm opacity-95">{email}</span>
          <button
            onClick={handleLogout}
            className="ml-2 p-2 hover:bg-white/20 rounded-md transition-colors cursor-pointer scale-100 active:scale-95 ease-in-out"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
