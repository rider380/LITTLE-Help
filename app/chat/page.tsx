"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestId = searchParams.get("request");
  const receiverId = searchParams.get("user");

  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadChat() {
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

      if (!requestId || !receiverId) {
        setErrorMessage("Chat details are missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("request_id", requestId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const loadedMessages = (data || []) as Message[];

      const unreadIds = loadedMessages
        .filter(
          (item) =>
            item.receiver_id === user.id &&
            item.sender_id === receiverId &&
            !item.is_read
        )
        .map((item) => item.id);

      if (unreadIds.length > 0) {
        const { error: updateError } = await supabase
          .from("chat_messages")
          .update({ is_read: true })
          .in("id", unreadIds);

        if (!active) return;

        if (updateError) {
          setErrorMessage(updateError.message);
        } else {
          loadedMessages.forEach((item) => {
            if (unreadIds.includes(item.id)) {
              item.is_read = true;
            }
          });
        }
      }

      if (!active) return;

      setMessages(loadedMessages);
      setLoading(false);
    }

    void loadChat();

    return () => {
      active = false;
    };
  }, [requestId, receiverId, router]);

  useEffect(() => {
    if (!requestId || !userId || !receiverId) return;

    const channel = supabase
      .channel(`chat-${requestId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          const incoming = payload.new as Message;

          const belongsToChat =
            (incoming.sender_id === userId &&
              incoming.receiver_id === receiverId) ||
            (incoming.sender_id === receiverId &&
              incoming.receiver_id === userId);

          if (!belongsToChat) return;

          let updatedMessage = incoming;

          if (incoming.receiver_id === userId && !incoming.is_read) {
            const { error } = await supabase
              .from("chat_messages")
              .update({ is_read: true })
              .eq("id", incoming.id);

            if (!error) {
              updatedMessage = {
                ...incoming,
                is_read: true,
              };
            }
          }

          setMessages((previous) => {
            if (previous.some((item) => item.id === updatedMessage.id)) {
              return previous;
            }

            return [...previous, updatedMessage];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const updated = payload.new as Message;

          const belongsToChat =
            (updated.sender_id === userId &&
              updated.receiver_id === receiverId) ||
            (updated.sender_id === receiverId &&
              updated.receiver_id === userId);

          if (!belongsToChat) return;

          setMessages((previous) =>
            previous.map((item) =>
              item.id === updated.id
                ? { ...item, ...updated }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [requestId, userId, receiverId]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = newMessage.trim();

    if (!text || !requestId || !receiverId || !userId || sending) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    const { error } = await supabase.from("chat_messages").insert({
      request_id: requestId,
      sender_id: userId,
      receiver_id: receiverId,
      message: text,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setNewMessage("");
    }

    setSending(false);
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-5 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          💬 Little Help Chat
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Communicate safely about this help request.
        </p>

        <div className="mt-6 min-h-[350px] flex-1 space-y-4 rounded-2xl border bg-white p-5">
          {loading && (
            <p className="text-center text-emerald-700">
              Loading messages...
            </p>
          )}

          {!loading && !errorMessage && messages.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.sender_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  item.sender_id === userId
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {item.message}
                </p>

                <p className="mt-2 text-right text-xs opacity-70">
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </p>

                {item.sender_id === userId && (
                  <p className="mt-1 text-right text-xs">
                    {item.is_read ? "Read ✓✓" : "Sent ✓"}
                  </p>
                )}
              </div>
            </div>
          ))}

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            maxLength={3000}
            className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:border-emerald-600"
          />

          <button
            type="submit"
            disabled={sending || !newMessage.trim() || !receiverId || !userId}
            className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading Chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}