"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setIsError(false);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-5 py-12">
      <div className="w-full max-w-md">

        <a
          href="/"
          className="mb-8 block text-center text-3xl font-bold text-emerald-700"
        >
          Little<span className="text-gray-900">Help.</span>
        </a>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">

          <div className="text-center">
            <div className="text-5xl">🤝</div>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Welcome Back!
            </h1>

            <p className="mt-3 text-gray-500">
              Login to your Little Help account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm font-semibold text-emerald-700 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {message && (
              <div
                role="alert"
                className={`rounded-xl p-3 text-sm ${
                  isError
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>

          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-bold text-emerald-700 hover:underline"
            >
              Create Account
            </a>
          </p>

        </div>

        <a
          href="/"
          className="mt-7 block text-center text-sm font-medium text-gray-500 hover:text-emerald-700"
        >
          ← Back to Home
        </a>

      </div>
    </main>
  );
}