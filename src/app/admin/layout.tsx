// src/app/admin/layout.tsx

import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthWrapper>
  );
}
