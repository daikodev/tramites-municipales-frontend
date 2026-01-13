"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Eye, EyeOff, LogIn } from "lucide-react";
import { decodeJWT } from "@/lib/jwt";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Credenciales incorrectas");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      
      // Extraer userId del token JWT
      const payload = decodeJWT(data.token);
      if (payload) {
        // El userId puede estar en diferentes campos
        const userId = payload.userId || payload.id || payload.sub;
        if (userId) {
          localStorage.setItem("userId", userId.toString());
        }
      }
      
      // Si el backend también envía userId directamente, usarlo
      if (data.userId) {
        localStorage.setItem("userId", data.userId.toString());
      }
      
      router.push("/dasboard");
    } catch (err) {
      setError(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full h-[44px] rounded-[4px] border border-black/30 bg-[#f5f5f5] " +
    "px-4 pr-12 text-sm text-black caret-black " +
    "placeholder:text-[#9a9a9a] " +
    "focus:outline-none focus:ring-0 focus:border-[#bdbdbd]";

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <div className="relative">
        <input
          type="email"
          placeholder="Correo*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <User className="h-[18px] w-[18px] text-black/80 absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#111] hover:opacity-80"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <Eye className="h-[18px] w-[18px]" />
          ) : (
            <EyeOff className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-6
          text-sm
          h-[30px] w-full
          rounded-[4px]
          bg-[#0b3a77] text-white font-semibold
          flex items-center justify-center gap-2
          shadow-[0_4px_0_rgba(0,0,0,0.18)]
          hover:brightness-95 transition
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        <LogIn className="h-[18px] w-[18px]" />
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </button>

      <div className="grid gap-2 text-center text-sm">
        <Link href="#" className="text-[#0b3a77] hover:underline">
          ¿Olvidaste tu clave?
        </Link>
        <Link href="/auth/register" className="text-red-600 hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
}
