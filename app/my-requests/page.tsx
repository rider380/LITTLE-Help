"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/app/components/NotificationBell";

type Helper = {
  id: string;
  full_name: string | null;
  country: string | null;
  role: string | null;
};

type HelpRequest = {
  id: string;
  title: string;
  category: string;
  description: string;
  amount: number | null;
  location: string;
  status: string;
  created_at: string;
};

type Interest = {
  id: string;
  request_id: string;
  helper_id: string;
  status: string;
  created_at: string;
};

export default function MyRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [helpers, setHelpers] = useState<Record<string, Helper>>({});
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRequests() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      const { data: requestData, error: requestError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (requestError) {
        setErrorMessage(requestError.message);
        setLoading(false);
        return;
      }

      const myRequests = requestData || [];
      setRequests(myRequests);

      if (myRequests.length === 0) {
        setLoading(false);
        return;
      }

      const requestIds = myRequests.map((item) => item.id);

      const { data: interestData, error: interestError } = await supabase
        .from("help_interests")
        .select("id, request_id, helper_id, status, created_at")
        .in("request_id", requestIds);

      if (interestError) {
        setErrorMessage(interestError.message);
        setLoading(false);
        return;
      }

      const myInterests = interestData || [];
      setInterests(myInterests);

      const helperIds = Array.from(
        new Set(myInterests.map((item) => item.helper_id))
      );

      if (helperIds.length > 0) {
        const { data: helperData, error: helperError } = await supabase
          .from("profiles")
          .select("id, full_name, country, role")
          .in("id", helperIds);

        if (helperError) {
          setErrorMessage(helperError.message);
          setLoading(false);
          return;
        }

        const helperMap: Record<string, Helper> = {};

        (helperData || []).forEach((helper) => {
          helperMap[helper.id] = helper;
        });

        setHelpers(helperMap);
      }

      setLoading(false);
    }

    loadRequests();
  }, [router]);

  function getStatusStyle(status: string) {
    if (status === "approved") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-orange-100 text-orange-700";
  }

  function getStatusLabel(status: string) {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending Review";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <a href="/" className="text-2xl font-bold text-emerald-700">
            Little<span className="text-gray-900">Help.</span>
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <NotificationBell />

            <a
              href="/dashboard"
              className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Your Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          My Help Requests
        </h1>

        <p className="mt-3 text-gray-500">
          View your requests and see who is interested in helping you.
        </p>

        {loading && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center">
            Loading your requests...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-10 rounded-2xl bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && requests.length === 0 && (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center">
            <div className="text-5xl">📋</div>

            <h2 className="mt-5 text-xl font-bold">No Requests Yet</h2>

            <p className="mt-3 text-gray-500">
              You have not submitted any help requests yet.
            </p>

            <a
              href="/need-help"
              className="mt-7 inline-block rounded-xl bg-emerald-700 px-7 py-3 font-bold text-white"
            >
              Submit a Help Request →
            </a>
          </div>
        )}

        {!loading && !errorMessage && requests.length > 0 && (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm text-emerald-800">
                Total Submitted Requests
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-900">
                {requests.length}
              </p>
            </div>

            {requests.map((request) => {
              const requestInterests = interests.filter(
                (item) => item.request_id === request.id
              );

              return (
                <article
                  key={request.id}
                  className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {request.category}
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-gray-900">
                        {request.title}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-600">
                    {request.description}
                  </p>

                  <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-400">
                        Amount Requested
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {request.amount !== null
                          ? `₹${Number(request.amount).toLocaleString("en-IN")}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Location</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {request.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Submitted On</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {new Date(request.created_at).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-emerald-900">
                        🤝 Helpers Interested
                      </h3>

                      <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-700">
                        {requestInterests.length} Interested
                      </span>
                    </div>

                    {requestInterests.length === 0 ? (
                      <p className="mt-4 text-sm text-gray-600">
                        No helpers have shown interest yet.
                      </p>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {requestInterests.map((interest) => {
                          const helper = helpers[interest.helper_id];

                          return (
                            <div
                              key={interest.id}
                              className="rounded-xl border bg-white p-4"
                            >
                              <p className="font-bold text-gray-900">
                                {helper?.full_name || "Helper"}
                              </p>

                              <p className="mt-1 text-sm text-gray-600">
                                Country: {helper?.country || "Not provided"}
                              </p>

                              <p className="mt-1 text-sm text-gray-600">
                                Account:{" "}
                                {helper?.role === "both"
                                  ? "Both – Need Help & Help Others"
                                  : "I Want to Help"}
                              </p>

                              <p className="mt-2 text-xs text-gray-400">
                                Interested on:{" "}
                                {new Date(
                                  interest.created_at
                                ).toLocaleDateString("en-IN")}
                              </p>

                              <span className="mt-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                {interest.status === "accepted"
                                  ? "Accepted"
                                  : interest.status === "rejected"
                                    ? "Rejected"
                                    : "Interest Submitted"}
                              </span>

                              <a
                                href={`/chat?request=${request.id}&user=${interest.helper_id}`}
                                className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
                              >
                                💬 Chat Now
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <p className="mt-4 text-xs text-gray-500">
                      Helper phone numbers are hidden to protect privacy.
                    </p>
                  </div>
                </article>
              );
            })}

            <a
              href="/need-help"
              className="inline-block rounded-xl bg-emerald-700 px-7 py-3 font-bold text-white"
            >
              + Submit Another Request
            </a>
          </div>
        )}
      </section>

      <footer className="border-t bg-white py-6 text-center">
        <p className="text-sm text-gray-500">
          © 2026 Little Help. Global Helping Platform.
        </p>
      </footer>
    </main>
  );
}