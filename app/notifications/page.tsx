"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  user_id: string;
  request_id: string | null;
  message_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [openingId, setOpeningId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
      } else {
        setNotifications(data || []);
      }

      setLoading(false);
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          setNotifications((previous) => {
            if (previous.some((item) => item.id === newNotification.id)) {
              return previous;
            }

            return [newNotification, ...previous];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      return false;
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );

    return true;
  }

  async function openNotification(item: Notification) {
    if (!item.message_id) {
      setErrorMessage("Chat message details are missing.");
      return;
    }

    setOpeningId(item.id);
    setErrorMessage("");

    const { data: message, error } = await supabase
      .from("chat_messages")
      .select("sender_id, receiver_id, request_id")
      .eq("id", item.message_id)
      .single();

    if (error || !message) {
      setErrorMessage(error?.message || "Chat message not found.");
      setOpeningId("");
      return;
    }

    const otherUserId =
      message.sender_id === userId
        ? message.receiver_id
        : message.sender_id;

    const requestId = message.request_id || item.request_id;

    if (!requestId || !otherUserId) {
      setErrorMessage("Chat details are incomplete.");
      setOpeningId("");
      return;
    }

    if (!item.is_read) {
      const success = await markAsRead(item.id);

      if (!success) {
        setOpeningId("");
        return;
      }
    }

    router.push(
      `/chat?request=${encodeURIComponent(requestId)}&user=${encodeURIComponent(otherUserId)}`
    );
  }

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-5 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/" className="text-2xl font-bold text-emerald-700">
            Little<span className="text-gray-900">Help.</span>
          </a>

          <a
            href="/dashboard"
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications 🔔
            </h1>

            <p className="mt-2 text-gray-500">
              Stay updated with your Little Help account.
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            {unreadCount} Unread
          </span>
        </div>

        {loading && (
          <p className="mt-10 text-center text-emerald-700">
            Loading notifications...
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {errorMessage}
          </p>
        )}

        {!loading && notifications.length === 0 && !errorMessage && (
          <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
            <div className="text-5xl">🔔</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No Notifications Yet
            </h2>

            <p className="mt-2 text-gray-500">
              New messages and updates will appear here.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 ${
                item.is_read
                  ? "bg-white"
                  : "border-emerald-300 bg-emerald-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => void openNotification(item)}
                  disabled={openingId === item.id}
                  className="flex-1 text-left"
                >
                  <h2 className="font-bold text-gray-900">
                    🔔 {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    {item.body}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-3 text-sm font-bold text-emerald-700">
                    {openingId === item.id
                      ? "Opening Chat..."
                      : "Open Chat →"}
                  </p>
                </button>

                {!item.is_read && (
                  <button
                    type="button"
                    onClick={() => void markAsRead(item.id)}
                    className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    Mark Read
                  </button>
                )}

                {item.is_read && (
                  <span className="shrink-0 text-xs font-semibold text-gray-400">
                    Read ✓
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}