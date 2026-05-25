import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 shadow-sm">
        <h1 className="text-4xl font-bold">
          Forgot Password
        </h1>

        <p className="mt-3 text-muted-foreground">
          Enter your email to receive reset
          instructions
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter email address"
              className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
            />
          </div>

          <button className="h-12 w-full rounded-xl bg-[#2563eb] text-sm font-semibold text-white">
            Send Reset Link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-[#2563eb]"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}