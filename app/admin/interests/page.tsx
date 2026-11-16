"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Interest = {
  id: string;
  request_id: string;
  helper_id: string;
  status: string;
  created_at: string;
  helperName: string;
  helperPhone: string;
  helperCountry: string;
  helperRole: string;
  requestTitle: string;
  requestCategory: string;
  requestLocation: string;
  requestAmount: number | null;
};

export default function AdminInterestsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error || !profile?.is_admin) {
      setMessage("Access denied. Admin account required.");
      setLoading(false);
      return;
    }

    await loadInterests();
  }

  async function loadInterests() {
    setMessage("");

    const { data: interestData, error: interestError } =
      await supabase
        .from("help_interests")
        .select("id, request_id, helper_id, status, created_at")
        .order("created_at", { ascending: false });

    if (interestError) {
      setMessage(interestError.message);
      setLoading(false);
      return;
    }

    if (!interestData || interestData.length === 0) {
      setInterests([]);
      setLoading(false);
      return;
    }

    const helperIds = [
      ...new Set(interestData.map((item) => item.helper_id)),
    ];

    const requestIds = [
      ...new Set(interestData.map((item) => item.request_id)),
    ];

    const [profileResult, requestResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, country, role")
        .in("id", helperIds),

      supabase
        .from("help_requests")
        .select("id, title, category, location, amount")
        .in("id", requestIds),
    ]);

    if (profileResult.error) {
      setMessage(profileResult.error.message);
      setLoading(false);
      return;
    }

    if (requestResult.error) {
      setMessage(requestResult.error.message);
      setLoading(false);
      return;
    }

    const profileMap = new Map(
      (profileResult.data || []).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const requestMap = new Map(
      (requestResult.data || []).map((request) => [
        request.id,
        request,
      ])
    );

    const finalData: Interest[] = interestData.map((item) => {
      const helper = profileMap.get(item.helper_id);
      const request = requestMap.get(item.request_id);

      return {
        ...item,
        helperName: helper?.full_name || "Unknown Helper",
        helperPhone: helper?.phone || "Not provided",
        helperCountry: helper?.country || "Not provided",
        helperRole: helper?.role || "Unknown",
        requestTitle: request?.title || "Request unavailable",
        requestCategory: request?.category || "Unknown",
        requestLocation: request?.location || "Not provided",
        requestAmount: request?.amount ?? null,
      };
    });

    setInterests(finalData);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="text-lg font-semibold text-emerald-800">
          Loading Admin Dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Little Help
          </h1>
          <p className="text-sm text-gray-500">
            Admin Dashboard
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            Admin Home
          </button>

          <button
            onClick={loadInterests}
            className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-green-500 p-8 text-white">
          <p className="text-sm font-semibold text-emerald-100">
            ADMIN MANAGEMENT
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Helpers Interested 🤝
          </h2>

          <p className="mt-3 text-emerald-50">
            View people who have shown interest in helping
            approved requests.
          </p>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Helpers Interested
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {interests.length}
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {message}
          </div>
        )}

        {!message && interests.length === 0 && (
          <div className="mt-8 rounded-xl border bg-white p-10 text-center">
            <div className="text-4xl">🤝</div>

            <h3 className="mt-4 text-xl font-bold text-gray-800">
              No Helpers Interested Yet
            </h3>

            <p className="mt-2 text-gray-500">
              When someone clicks Help Now, their details
              will appear here.
            </p>
          </div>
        )}

        {!message && interests.length > 0 && (
          <div className="mt-8 space-y-6">
            {interests.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {item.requestCategory}
                  </span>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-800">
                  {item.requestTitle}
                </h3>

                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <h4 className="font-bold text-emerald-700">
                    Helper Details
                  </h4>

                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Name:</strong> {item.helperName}
                    </p>

                    <p>
                      <strong>Phone:</strong> {item.helperPhone}
                    </p>

                    <p>
                      <strong>Country:</strong> {item.helperCountry}
                    </p>

                    <p>
                      <strong>Account Type:</strong> {item.helperRole}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Request Location:</strong>{" "}
                    {item.requestLocation}
                  </p>

                  {item.requestAmount !== null && (
                    <p>
                      <strong>Requested Amount:</strong> ₹
                      {Number(item.requestAmount).toLocaleString("en-IN")}
                    </p>
                  )}

                  <p>
                    <strong>Interest Submitted:</strong>{" "}
                    {new Date(item.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t bg-white py-5 text-center text-sm text-gray-500">
        © 2026 Little Help. Together, We Can Change Lives.
      </footer>
    </main>
  );
}