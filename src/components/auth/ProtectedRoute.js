'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (requireAdmin && role !== "ADMIN") {
            router.push("/dasboard");
            return;
        }

        if (!requireAdmin && role === "ADMIN") {
            router.push("/admin/dashboard");
            return;
        }
    }, [router, requireAdmin]);

    return children;
}