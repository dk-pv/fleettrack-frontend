"use client";

import Link from "next/link";
import { Eye, EyeOff, Truck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      console.log(response.status);

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (data.success) {
        toast.success("Login successful");

        setAuth(data.user, data.token);

        document.cookie = `token=${data.token}; path=/`;

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden w-1/2 flex-col justify-between bg-[linear-gradient(180deg,#111827_0%,#0f172a_55%,#020817_100%)] p-12 text-white lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb]">
            <Truck className="h-7 w-7 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-bold">FleetTrack</h1>

            <p className="mt-1 text-slate-400">GPS Fleet Monitoring Platform</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md">
          <h2 className="text-5xl font-bold leading-tight">
            Manage Your Fleet
            <br />
            Smarter & Faster
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Monitor vehicles, manage drivers, track live locations and optimize
            fleet operations from one unified dashboard.
          </p>
        </div>

        {/* Footer */}
        <div>
          <p className="text-sm text-slate-500">
            © 2026 FleetTrack. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 shadow-sm">
          {/* Header */}
          <div>
            <h2 className="text-4xl font-bold tracking-tight">Welcome Back</h2>

            <p className="mt-3 text-muted-foreground">
              Login to continue to FleetTrack dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-10 space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-muted px-4 pr-12 text-sm outline-none transition-colors focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#2563eb]"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#2563eb] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-sm text-muted-foreground">
              FleetTrack Admin Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
