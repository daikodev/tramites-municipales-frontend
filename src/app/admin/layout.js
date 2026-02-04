'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminHeader from '@/components/dashboard/AdminHeader';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <main className="min-h-screen bg-[#d9d9d9]">
        <AdminHeader />
        <div className="mx-auto max-w-[1120px] px-8 py-8">{children}</div>
      </main>
    </ProtectedRoute>
  );
}
