"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "DNI",
    nDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    correo: "",
    password: "",
    confirmPassword: "",
    aceptaTerminos: false,
  });

  const today = new Date();
  const maxBirthDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  const maxBirthDateStr = maxBirthDate.toISOString().slice(0, 10);

  const ROL_FIJO = "CIUDADANO";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const DOC_RULES = useMemo(
    () => ({
      DNI: { label: "DNI", len: 8 },
      PASAPORTE: { label: "Pasaporte", len: 9 },
      CE: { label: "Carnet de Extranjería", len: 9 },
    }),
    [],
  );

  const docLen = DOC_RULES[formData.tipoDocumento]?.len ?? 20;
  const docLabel = DOC_RULES[formData.tipoDocumento]?.label ?? "Documento";

  const onlyLetters = (v) =>
    v.replace(/[^\p{L}\s]/gu, "").replace(/\s{2,}/g, " ");

  const onlyNumbers = (v) => v.replace(/\D/g, "");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let nextValue = value;

    if (name === "nombres" || name === "apellidos") {
      nextValue = onlyLetters(value);
    }

    if (name === "nDocumento") {
      nextValue = onlyNumbers(value).slice(0, docLen);
    }

    if (name === "telefono") {
      nextValue = onlyNumbers(value).slice(0, 9);
    }

    if (name === "tipoDocumento") {
      setFormData((prev) => ({
        ...prev,
        tipoDocumento: nextValue,
        nDocumento: prev.nDocumento
          ? prev.nDocumento.slice(0, DOC_RULES[nextValue].len)
          : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : nextValue,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const nameOk = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(formData.nombres.trim());
    const lastNameOk = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(
      formData.apellidos.trim(),
    );

    if (!nameOk) return setError("El nombre solo debe contener letras.");
    if (!lastNameOk)
      return setError("Los apellidos solo deben contener letras.");

    const doc = formData.nDocumento.trim();
    if (!/^\d+$/.test(doc))
      return setError("El número de documento solo debe contener números.");
    if (doc.length !== docLen) {
      return setError(`${docLabel} debe tener exactamente ${docLen} dígitos.`);
    }

    const phone = formData.telefono.trim();
    if (!/^\d+$/.test(phone))
      return setError("El teléfono solo debe contener números.");
    if (!phone) return setError("El teléfono es obligatorio.");

    if (!formData.aceptaTerminos)
      return setError("Debes aceptar los términos y condiciones.");
    if (formData.password !== formData.confirmPassword)
      return setError("Las contraseñas no coinciden.");
    if (!formData.direccion?.trim())
      return setError("La dirección es obligatoria.");
    if (!formData.fechaNacimiento)
      return setError("La fecha de nacimiento es obligatoria.");

    const birth = new Date(formData.fechaNacimiento + "T00:00:00");
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 18) {
      setError("Debes ser mayor de 18 años para registrarte.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.nombres.trim(),
        lastName: formData.apellidos.trim(),
        documentType: formData.tipoDocumento,
        birthDate: formData.fechaNacimiento,
        document: doc,
        email: formData.correo.trim(),
        password: formData.password,
        phoneNumber: phone,
        address: formData.direccion.trim(),
        role: ROL_FIJO,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo registrar");

      router.push("/auth/login");
    } catch (err) {
      setError(err?.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[12px] text-[#0b3a77] mb-2";
  const fieldClass =
    "w-full h-[42px] rounded-[4px] " +
    "border border-black/25 bg-[#f3f3f3] " +
    "px-4 text-sm text-black placeholder:text-black/35 " +
    "focus:outline-none focus:border-black/45";

  const selectClass =
    fieldClass +
    " appearance-none pr-10 " +
    "bg-[linear-gradient(45deg,transparent_50%,#000_50%),linear-gradient(135deg,#000_50%,transparent_50%),linear-gradient(to_right,transparent,transparent)] " +
    "bg-[length:8px_8px,8px_8px,2.5rem_100%] " +
    "bg-[position:calc(100%-18px)_50%,calc(100%-12px)_50%,100%_0] bg-no-repeat";

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className={labelClass}>Nombres completos</p>
          <input
            type="text"
            name="nombres"
            placeholder="Nombre*"
            value={formData.nombres}
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <p className={labelClass}>Apellidos completos</p>
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos*"
            value={formData.apellidos}
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <p className={labelClass}>Tipo de Documento</p>
          <select
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="DNI">DNI</option>
            <option value="PASAPORTE">PASAPORTE</option>
            <option value="CE">CARNET DE EXTRANJERIA</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className={labelClass}>Documento</p>
          <input
            type="text"
            name="nDocumento"
            placeholder={`N° Documento* (${docLen} dígitos)`}
            value={formData.nDocumento}
            onChange={handleChange}
            className={fieldClass}
            required
            inputMode="numeric"
            maxLength={docLen}
            autoComplete="off"
          />
        </div>

        <div>
          <p className={labelClass}>Fecha de nacimiento</p>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className={fieldClass}
            required
            max={maxBirthDateStr}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className={labelClass}>Teléfono</p>
          <input
            type="tel"
            name="telefono"
            placeholder="Número de Teléfono*"
            value={formData.telefono}
            onChange={handleChange}
            className={fieldClass}
            required
            inputMode="numeric"
            maxLength={9}
          />
        </div>

        <div>
          <p className={labelClass}>Dirección</p>
          <input
            type="text"
            name="direccion"
            placeholder="Dirección*"
            value={formData.direccion}
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>
      </div>

      {/* Acceso */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 pt-4">
        <div>
          <p className="text-[13px] text-[#0b3a77] font-semibold mb-3">
            Configurar su acceso
          </p>

          <input
            type="email"
            name="correo"
            placeholder="Correo Electronico*"
            value={formData.correo}
            onChange={handleChange}
            className={fieldClass + " mb-6"}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña*"
                value={formData.password}
                onChange={handleChange}
                className={fieldClass + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-black/80 hover:text-black"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar Contraseña*"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={fieldClass + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-black/80 hover:text-black"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* terminos + Boton */}
        <div className="flex flex-col items-center justify-end gap-6">
          <label className="flex items-start text-sm text-black/90 text-center">
            <input
              type="checkbox"
              name="aceptaTerminos"
              checked={formData.aceptaTerminos}
              onChange={handleChange}
              className="mt-1"
            />
            <span>
              He leído y aceptado <br />
              los <u>términos</u> y condiciones de <br />
              uso.
            </span>
          </label>

          <button
            type="submit"
            disabled={!formData.aceptaTerminos || loading}
            className="
              w-full h-[34px]
              rounded-[4px]
              bg-[#2bbd17] text-white font-semibold text-sm
              flex items-center justify-center gap-2
              hover:brightness-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Registrando..." : "Registrarse"}
            <CheckCircle className="h-4 w-4" />
          </button>

          <p className="text-center text-sm text-black/70">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-[#0b3a77] font-semibold hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </form>
  );
}
