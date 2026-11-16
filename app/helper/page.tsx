"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/app/components/NotificationBell";

type HelpRequest = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  amount: number | null;
  location: string;
  created_at: string;
};

export default function HelperPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Helper");
  const [savingId, setSavingId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/login");
      return;
    }

    setCurrentUserId(authData.user.id);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", authData.user.id)
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setName(profile.full_name || "Helper");

    if (profile.role !== "helper" && profile.role !== "both") {
      setMessage("Please login with a Helper account.");
      setLoading(false);
      return;
    }

    await loadRequests(authData.user.id);
  }

  async function loadRequests(userId: string) {
    setMessage("");

    const { data, error } = await supabase
      .from("help_requests")
      .select(
        "id, user_id, title, category, description, amount, location, created_at"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data: interests, error: interestError } = await supabase
      .from("help_interests")
      .select("request_id")
      .eq("helper_id", userId);

    if (interestError) {
      setMessage(interestError.message);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setInterestedIds(
      (interests || []).map((item) => item.request_id)
    );

    setLoading(false);
  }

  async function handleHelpNow(requestId: string) {
    if (!currentUserId || savingId) return;

    setSavingId(requestId);
    setMessage("");

    const { error } = await supabase
      .from("help_interests")
      .insert({
        request_id: requestId,
        helper_id: currentUserId,
      });

    if (error) {
      if (error.code === "23505") {
        setInterestedIds((old) => [...new Set([...old, requestId])]);
        setMessage("You have already shown interest.");
      } else {
        setMessage(error.message);
      }
    } else {
      setInterestedIds((old) => [...old, requestId]);
      setMessage("Your interest was submitted successfully.");
    }

    setSavingId("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="font-semibold text-emerald-800">
          Loading Helper Dashboard...
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
            Global Helping Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NotificationBell />

          <button
            onClick={() => loadRequests(currentUserId)}
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
          <p className="text-sm text-emerald-100">
            HELPER DASHBOARD
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome, {name}!
          </h2>

          <p className="mt-3">
            Your kindness can make a difference.
          </p>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800">
            Approved Help Requests
          </h3>

          <p className="mt-5 text-2xl font-bold text-emerald-700">
            {requests.length}
          </p>

          <p className="text-sm text-gray-500">
            Approved Requests Available
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {requests.map((request) => {
            const alreadyInterested = interestedIds.includes(request.id);
            const isOwnRequest = request.user_id === currentUserId;

            return (
              <article
                key={request.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {request.category}
                </span>

                <span className="ml-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Approved
                </span>

                <h3 className="mt-4 text-xl font-bold text-gray-800">
                  {request.title}
                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                  {request.description}
                </p>

                <div className="mt-5 space-y-2 border-t pt-4 text-sm text-gray-600">
                  <p>
                    <strong>Location:</strong> {request.location}
                  </p>

                  {request.amount !== null && (
                    <p>
                      <strong>Requested Amount:</strong>{" "}
                      ₹{Number(request.amount).toLocaleString("en-IN")}
                    </p>
                  )}

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(request.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {!isOwnRequest && (
                  <>
                    <button
                      onClick={() => handleHelpNow(request.id)}
                      disabled={alreadyInterested || savingId === request.id}
                      className="mt-6 w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white disabled:bg-gray-400"
                    >
                      {savingId === request.id
                        ? "Submitting..."
                        : alreadyInterested
                        ? "Interest Submitted ✓"
                        : "Help Now 🤝"}
                    </button>

                    {alreadyInterested && (
                      <a
                        href={
                          "/chat?request=" +
                          encodeURIComponent(request.id) +
                          "&user=" +
                          encodeURIComponent(request.user_id)
                        }
                        className="mt-3 block w-full rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
                      >
                        Chat Now 💬
                      </a>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <footer className="border-t bg-white py-5 text-center text-sm text-gray-500">
        © 2026 Little Help. Together, We Can Change Lives.
      </footer>
    </main>
  );
}