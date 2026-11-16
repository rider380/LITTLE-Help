"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password updated successfully!");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <a href="/" className="text-2xl font-bold text-emerald-700">
          Little<span className="text-gray-900">Help.</span>
        </a>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Reset Password
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Create a new password for your Little Help account.
        </p>

        <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
              required
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              required
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <a
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-emerald-700"
        >
          Back to Login
        </a>
      </div>
    </main>
  );
}