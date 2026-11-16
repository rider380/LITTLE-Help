"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (authError || !data.user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, is_admin")
          .eq("id", data.user.id)
          .single();

        if (!active) return;

        if (error || !profile) {
          setMessage("Unable to load account details.");
          setLoading(false);
          return;
        }

        if (profile.is_admin === true) {
          router.replace("/admin");
          return;
        }

        if (profile.role === "helper") {
          router.replace("/helper");
          return;
        }

        if (profile.role === "seeker") {
          router.replace("/my-requests");
          return;
        }

        if (profile.role === "both") {
          setLoading(false);
          return;
        }

        setMessage("Account role not recognized.");
        setLoading(false);
      } catch {
        if (active) {
          setMessage("Something went wrong. Please try again.");
          setLoading(false);
        }
      }
    }

    checkUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-700">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">

        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-emerald-700">
            Little Help
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <section className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Little Help!
          </h2>

          <p className="mt-3 text-gray-600">
            Together, we can make the world a better place.
          </p>

          {message && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">
              {message}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <a
              href="/need-help"
              className="rounded-2xl bg-emerald-700 p-6 text-center font-bold text-white hover:bg-emerald-800"
            >
              <span className="block text-3xl">🆘</span>
              <span className="mt-3 block">I Need Help</span>
            </a>

            <a
              href="/helper"
              className="rounded-2xl bg-blue-700 p-6 text-center font-bold text-white hover:bg-blue-800"
            >
              <span className="block text-3xl">🤝</span>
              <span className="mt-3 block">I Want to Help</span>
            </a>

            <a
              href="/my-requests"
              className="rounded-2xl border border-emerald-200 p-6 text-center font-bold text-emerald-800 hover:bg-emerald-50 sm:col-span-2"
            >
              My Help Requests
            </a>

          </div>
        </section>
      </div>
    </main>
  );
}