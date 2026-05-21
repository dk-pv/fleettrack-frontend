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

      <div className="ml-[88px] transition-all duration-300">
        <Navbar />

        <section className="pt-16">
          {children}
        </section>
      </div>
    </main>
  );
}