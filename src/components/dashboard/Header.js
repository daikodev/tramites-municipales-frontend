"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const initial = useMemo(() => {
    return email ? email.charAt(0).toUpperCase() : "U";
  }, [email]);

  const navItems = [
    { href: "/tramites", label: "Trámites" },
    { href: "/historial", label: "Historial" },
    { href: "/faq", label: "FAQ" },
  ];

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("applicationId");
    localStorage.removeItem("currentRequisitos");
    localStorage.removeItem("currentApplicationId");

    // Redirigir al login
    router.push("/auth/login");
  };

  return (
    <header className="bg-[#0b63c7] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
        {/* HAMBURGUESA SOLO MÓVIL */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden h-10 w-10 rounded-md bg-white/15 border border-white/25 flex items-center justify-center"
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden md:flex items-center gap-4">
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
            <p className="text-[26px] font-semibold">Plataforma de Trámites</p>
            <span className="text-[13px] opacity-80">Municipalidad de Ate</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white/18 border border-white/25 rounded-lg px-4 py-2">
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

      {/* MENU DESPLEGABLE*/}
      {isOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#0b63c7]">
          <div className="px-4 py-4 space-y-4">
            <div className="bg-white/18 border border-white/25 rounded-lg px-4 py-2">
              <p className="text-sm">{email}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold hover:bg-white/15 transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-white/10 hover:bg-white/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
