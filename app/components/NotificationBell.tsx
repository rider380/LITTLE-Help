"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    async function start() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || !mounted) return;

      const refreshCount = async () => {
        const { count, error: countError } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (!countError && mounted) {
          setUnreadCount(count ?? 0);
        }
      };

      await refreshCount();

      if (!mounted) return;

      channel = supabase
        .channel("notification-bell-" + user.id)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: "user_id=eq." + user.id,
          },
          () => {
            void refreshCount();
          }
        )
        .subscribe();
    }

    void start();

    return () => {
      mounted = false;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
    >
      <span className="text-xl">🔔</span>
      <span>Notifications</span>

      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}