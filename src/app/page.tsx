import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <section className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            FleetTrack Dashboard
          </h2>

          <p className="mt-3 text-muted-foreground">
            Modern Fleet Management System
          </p>
        </div>
      </section>
    </main>
  );
}