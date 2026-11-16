"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

type ChatItem = {
  requestId: string;
  otherUserId: string;
  otherUserName: string;
  requestTitle: string;
  lastMessage: string;
  lastMessageTime: string;
};

export default function MyChatsPage() {
  const router = useRouter();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadChats() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
        )
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const allMessages = (messages || []) as ChatMessage[];

      const uniqueChats = new Map<string, ChatMessage>();

      allMessages.forEach((message) => {
        const otherUserId =
          message.sender_id === user.id
            ? message.receiver_id
            : message.sender_id;

        const key = `${message.request_id}-${otherUserId}`;

        if (!uniqueChats.has(key)) {
          uniqueChats.set(key, message);
        }
      });

      const chatMessages = Array.from(uniqueChats.values());

      const otherUserIds = [
        ...new Set(
          chatMessages.map((message) =>
            message.sender_id === user.id
              ? message.receiver_id
              : message.sender_id
          )
        ),
      ];

      const requestIds = [
        ...new Set(chatMessages.map((message) => message.request_id)),
      ];

      const [profilesResult, requestsResult] = await Promise.all([
        otherUserIds.length
          ? supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", otherUserIds)
          : Promise.resolve({ data: [], error: null }),

        requestIds.length
          ? supabase
              .from("help_requests")
              .select("id, title")
              .in("id", requestIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!active) return;

      if (profilesResult.error || requestsResult.error) {
        setErrorMessage(
          profilesResult.error?.message ||
            requestsResult.error?.message ||
            "Could not load chat details."
        );
        setLoading(false);
        return;
      }

      const profiles = profilesResult.data || [];
      const requests = requestsResult.data || [];

      const chatList: ChatItem[] = chatMessages.map((message) => {
        const otherUserId =
          message.sender_id === user.id
            ? message.receiver_id
            : message.sender_id;

        const profile = profiles.find(
          (item) => item.id === otherUserId
        );

        const request = requests.find(
          (item) => item.id === message.request_id
        );

        return {
          requestId: message.request_id,
          otherUserId,
          otherUserName: profile?.full_name || "Little Help User",
          requestTitle: request?.title || "Help Request",
          lastMessage: message.message,
          lastMessageTime: message.created_at,
        };
      });

      setChats(chatList);
      setLoading(false);
    }

    void loadChats();

    return () => {
      active = false;
    };
  }, [router]);

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
        <h1 className="text-3xl font-bold text-gray-900">
          My Chats 💬
        </h1>

        <p className="mt-2 text-gray-500">
          View and continue your conversations.
        </p>

        {loading && (
          <p className="mt-10 text-center text-emerald-700">
            Loading chats...
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && chats.length === 0 && (
          <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
            <div className="text-5xl">💬</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No Chats Yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your conversations will appear here.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {chats.map((chat) => (
            <div
              key={`${chat.requestId}-${chat.otherUserId}`}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    👤 {chat.otherUserName}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    {chat.requestTitle}
                  </p>

                  <p className="mt-3 break-words text-sm text-gray-600">
                    {chat.lastMessage}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(chat.lastMessageTime).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/chat?request=${encodeURIComponent(
                        chat.requestId
                      )}&user=${encodeURIComponent(chat.otherUserId)}`
                    )
                  }
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  Open Chat →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}