import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("🔒 No hay token - redirigiendo al login");
      router.push("/auth/login");
    }
  }, [router]);

  const checkAuthError = (response) => {
    if (response.status === 401) {
      console.log("🔒 Token expirado o inválido - redirigiendo al login");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      router.push("/auth/login");
      return true;
    }
    return false;
  };

  return { checkAuthError };
}
