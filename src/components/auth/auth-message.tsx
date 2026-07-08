import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthMessageProps {
  variant: "success" | "error";
  children: React.ReactNode;
}

/** Shared inline success/error banner for auth forms (tokenized, dark-mode aware). */
export default function AuthMessage({ variant, children }: AuthMessageProps) {
  const success = variant === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
        success
          ? "border-success/20 bg-success/10 text-success"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
