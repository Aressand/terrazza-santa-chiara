// src/app/[lang]/layout.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileContactActions from "@/components/MobileContactActions";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Await params to satisfy Next.js 16 async params requirement
  await params;
  return (
    <>
      <Header />
      <MobileContactActions />
      {children}
      <Footer />
    </>
  );
}
