// src/app/(main)/layout.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileContactActions from "@/components/MobileContactActions";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MobileContactActions />
      {children}
      <Footer />
    </>
  );
}
