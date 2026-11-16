"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/app/components/NotificationBell";

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

    void checkUser();

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-base font-semibold text-emerald-700 sm:text-lg">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-emerald-700 sm:text-3xl">
            Little<span className="text-gray-900">Help.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <NotificationBell />

            <button
              onClick={handleLogout}
              className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 sm:px-5"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm sm:mt-8">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-5 py-9 text-white sm:px-10 sm:py-14">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold sm:text-sm">
              GLOBAL HELPING PLATFORM
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Welcome to Little Help!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base sm:leading-7">
              Together, we can make the world a better place.
              Every small act of kindness can create a big difference.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-10 sm:py-9">

            {message && (
              <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {message}
              </p>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                What would you like to do?
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Choose an option below to continue.
              </p>
            </div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Link
                href="/need-help"
                className="group flex min-h-44 flex-col items-center justify-center rounded-2xl bg-emerald-700 p-6 text-center text-white shadow-sm transition hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
              >
                <span className="text-4xl sm:text-5xl">🆘</span>

                <h3 className="mt-4 text-lg font-extrabold sm:text-xl">
                  I Need Help
                </h3>

                <p className="mt-2 text-sm text-emerald-50">
                  Submit your help request
                </p>
              </Link>

              <Link
                href="/helper"
                className="group flex min-h-44 flex-col items-center justify-center rounded-2xl bg-blue-700 p-6 text-center text-white shadow-sm transition hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg"
              >
                <span className="text-4xl sm:text-5xl">🤝</span>

                <h3 className="mt-4 text-lg font-extrabold sm:text-xl">
                  I Want to Help
                </h3>

                <p className="mt-2 text-sm text-blue-50">
                  Find people who need support
                </p>
              </Link>

            </div>

            {/* Other Links */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <Link
                href="/my-requests"
                className="flex min-h-14 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 sm:text-base"
              >
                📋 My Help Requests
              </Link>

              <Link
                href="/my-chats"
                className="flex min-h-14 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-800 transition hover:bg-blue-100 sm:text-base"
              >
                💬 My Chats
              </Link>

            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="px-3 py-7 text-center">
          <p className="text-sm font-medium text-gray-500">
            Little Help — Together, We Make a Difference ❤️
          </p>
        </footer>

      </div>
    </main>
  );
}