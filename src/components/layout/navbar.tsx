import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div>
        <h1 className="text-lg font-semibold">
          FleetTrack
        </h1>
      </div>

      <ThemeToggle />
    </header>
  );
}