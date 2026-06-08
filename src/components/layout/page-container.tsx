
interface PageContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function PageContainer({
  title,
  description,
  children,
}: PageContainerProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">
              {title}
            </h1>
          )}

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
