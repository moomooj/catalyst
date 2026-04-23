"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminLoginSchema } from "@/features/auth/schema";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const result = adminLoginSchema.safeParse({ email, password });
    if (result.success) {
      return {};
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      email: fieldErrors.email?.[0],
      password: fieldErrors.password?.[0],
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!result.ok) {
        setFormError(result.error ?? "Login failed. Please try again.");
        return;
      }
      // TODO: Set session cookie or token server-side.
      router.push("/admin/dashboard");
    } catch {
      setFormError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { method: "GET" });
        if (!response.ok) {
          return;
        }
        const result = (await response.json()) as { ok: boolean };
        if (result.ok && isMounted) {
          router.replace("/admin/dashboard");
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingSession) {
    return null;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <div className="w-full max-w-md border border-[#D6CAB7] bg-white p-10 shadow-xl animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]">
            Login
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Sign in to continue
          </h1>

        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }));
                setErrors(validate());
              }}
              className="w-full rounded-md border border-[#D6CAB7] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#7C826F]"
              placeholder="you@company.com"
            />
            {touched.email && errors.email ? (
              <p className="text-xs text-[#B3261E]">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-password">
              Password
            </label>
            <div className="flex items-center rounded-md border border-[#D6CAB7] bg-white px-3 py-2">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, password: true }));
                  setErrors(validate());
                }}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-3 text-xs font-medium text-[#7C826F]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched.password && errors.password ? (
              <p className="text-xs text-[#B3261E]">{errors.password}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/"
              className="text-xs text-[#7C826F] hover:text-[#303520]"
            >
              Back to site
            </Link>
          </div>

          {formError ? (
            <div className="rounded-md border border-[#D6CAB7] bg-[#EAE8E4] px-3 py-2 text-xs text-[#B3261E]">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#7C826F] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#7C826F] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
