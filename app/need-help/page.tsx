"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const categories = [
  "Food & Essentials",
  "Medical Support",
  "Education",
  "Shelter & Housing",
  "Clothing",
  "Other Needs",
];

export default function NeedHelpPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food & Essentials");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    if (description.trim().length < 20) {
      setIsError(true);
      setMessage("Description must contain at least 20 characters.");
      return;
    }

    if (amount && Number(amount) <= 0) {
      setIsError(true);
      setMessage("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("help_requests").insert({
      user_id: user.id,
      title: title.trim(),
      category,
      description: description.trim(),
      amount: amount ? Number(amount) : null,
      location: location.trim(),
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    setMessage(
      "Your help request has been submitted successfully. It is waiting for review."
    );

    setTitle("");
    setCategory("Food & Essentials");
    setDescription("");
    setAmount("");
    setLocation("");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">

      <div className="mx-auto max-w-2xl">

        <a
          href="/dashboard"
          className="font-semibold text-emerald-700 hover:underline"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-lg sm:p-10">

          <div className="text-center">

            <div className="text-5xl">🤝</div>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Request Help
            </h1>

            <p className="mt-3 text-gray-500">
              Tell us what support you need. Our team will review your request.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Request Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Need help for education"
                required
                maxLength={150}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Help Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Describe Your Need
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why you need help and how it will be used..."
                required
                minLength={20}
                maxLength={3000}
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Minimum 20 characters.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Amount Needed (INR) – Optional
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Example: 5000"
                min="1"
                step="0.01"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Your Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State, Country"
                required
                maxLength={200}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {message && (
              <div
                role="status"
                className={
                  isError
                    ? "rounded-xl bg-red-50 p-4 text-sm text-red-700"
                    : "rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Help Request →"}
            </button>

          </form>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Your request will remain pending until it is reviewed and approved.
          </p>

        </div>

      </div>

    </main>
  );
}