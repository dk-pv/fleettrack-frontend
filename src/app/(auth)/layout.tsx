export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] dark:bg-[#020817]">
      {children}
    </main>
  );
}