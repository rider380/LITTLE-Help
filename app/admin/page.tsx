"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type HelpRequest = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  amount: number | null;
  location: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setMessage("Admin verification error: " + profileError.message);
      setLoading(false);
      return;
    }

    if (!profile?.is_admin) {
      setMessage("Access denied. This account is not an administrator.");
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await loadRequests();
  }

  async function loadRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("help_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Request loading error: " + error.message);
    } else {
      setRequests((data || []) as HelpRequest[]);
      setMessage("");
    }

    setLoading(false);
  }

  async function updateStatus(
    id: string,
    status: "approved" | "rejected"
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this request?`
    );

    if (!confirmed) return;

    setUpdatingId(id);

    const { error } = await supabase
      .from("help_requests")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Request successfully ${status}.`);
    await loadRequests();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const pending = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const approved = requests.filter(
    (r) => r.status === "approved"
  ).length;

  const rejected = requests.filter(
    (r) => r.status === "rejected"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-emerald-700">
          Verifying Admin Account...
        </p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Admin Verification Failed
          </h1>
          <p className="mt-4 text-gray-600">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <a href="/" className="text-2xl font-bold text-emerald-700">
            Little<span className="text-gray-900">Help.</span>
          </a>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin/interests")}
              className="rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800"
            >
              🤝 Helpers Interested
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-200 px-5 py-2 font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
          Little Help Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Welcome, Admin! 👋
        </h1>

        <p className="mt-3 text-gray-500">
          Manage and review help requests submitted by users.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-orange-50 p-6">
            <p className="font-semibold text-orange-700">
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-900">
              {pending}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-6">
            <p className="font-semibold text-emerald-700">
              Approved Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {approved}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              Rejected Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-red-900">
              {rejected}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            All Help Requests
          </h2>

          <button
            onClick={loadRequests}
            className="rounded-xl border bg-white px-5 py-2 font-semibold hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-blue-50 p-4 text-blue-800">
            {message}
          </div>
        )}

        {requests.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">📋</p>
            <h3 className="mt-4 text-xl font-bold">
              No Help Requests Found
            </h3>
            <p className="mt-2 text-gray-500">
              Submitted requests will appear here.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-700">
                    {request.category}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {request.title}
                  </h3>
                </div>

                <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold">
                  {request.status.toUpperCase()}
                </span>
              </div>

              <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-600">
                {request.description}
              </p>

              <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Amount Requested</p>
                  <p className="mt-1 font-semibold">
                    {request.amount !== null
                      ? `₹${Number(request.amount).toLocaleString("en-IN")}`
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="mt-1 font-semibold">{request.location}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Submitted On</p>
                  <p className="mt-1 font-semibold">
                    {new Date(request.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              {request.status === "pending" && (
                <div className="mt-7 flex flex-wrap gap-3 border-t pt-6">
                  <button
                    onClick={() => updateStatus(request.id, "approved")}
                    disabled={updatingId === request.id}
                    className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    Approve Request
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, "rejected")}
                    disabled={updatingId === request.id}
                    className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400">
                Request ID: {request.id}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © 2026 Little Help. Global Helping Platform.
      </footer>
    </main>
  );
}