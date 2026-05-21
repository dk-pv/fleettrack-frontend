import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
      <Sidebar />

      <Navbar />

      <section className="ml-[250px] pt-16">
        {children}
      </section>
    </main>
  );
}