"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Password reset link requested. Please check your email inbox and spam folder."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <a href="/" className="text-2xl font-bold text-emerald-700">
          Little<span className="text-gray-900">Help.</span>
        </a>

        <h1 className="mt-8 text-2xl font-bold text-gray-900">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter your registered email address. We will request a password
          reset link for your account.
        </p>

        <form onSubmit={handleReset} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
            />
          </div>

          {message && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}