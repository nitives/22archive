"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { supabaseBrowser } from "@/lib/supabase/client";
import { buttonStyle, inputStyle } from "@/styles/forms";
import Link from "next/link";
import { z } from "zod";
import { roleEnum } from "@/conf/schemas";

type Role = z.infer<typeof roleEnum>;

const profileRowSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().nullable(),
  role: roleEnum,
  createdAt: z.string(),
});

const usersResponseSchema = z.object({
  users: z.array(profileRowSchema),
});

type ProfileRow = z.infer<typeof profileRowSchema>;

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function RolePill({ role }: { role: Role }) {
  const base =
    "text-[11px] px-2 py-0.5 rounded-full border border-black/15 dark:border-white/10";
  const extra =
    role === "ADMIN"
      ? "opacity-95"
      : role === "TRUSTED"
        ? "opacity-80"
        : "opacity-60";
  return <span className={clsx(base, extra)}>{role}</span>;
}

export default function AdminUsersPage() {
  const [session, setSession] =
    useState<
      Awaited<
        ReturnType<ReturnType<typeof supabaseBrowser>["auth"]["getSession"]>
      >["data"]["session"]
    >(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const supabase = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: `${location.origin}/admin/users` },
    });
    if (error) setAuthMsg(`${error.message}`);
    else setAuthMsg("Check your email for the sign-in link.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const refresh = useCallback(async () => {
    if (!session) return;
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed: ${res.status}`);
      }

      const parsed = usersResponseSchema.safeParse(await res.json());
      if (!parsed.success) throw new Error("Invalid response payload");
      setUsers(parsed.data.users);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [session]);

  async function setRole(userId: string, role: "TRUSTED" | "PENDING") {
    if (!session) return;
    setStatus("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed: ${res.status}`);
      }

      // update local
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role } : u)),
      );
      setStatus(`Updated role to ${role}`);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  useEffect(() => {
    if (session) void refresh();
  }, [refresh, session]);

  const counts = useMemo(() => {
    const c: Record<Role, number> = { ADMIN: 0, TRUSTED: 0, PENDING: 0 };
    for (const u of users) c[u.role] = (c[u.role] ?? 0) + 1;
    return c;
  }, [users]);

  if (!session) {
    return (
      <main
        className={clsx("p-6 max-w-xl mx-auto", "mt-[var(--titlebar-height)]")}
      >
        <h1 className="text-xl mb-4">Admin Login</h1>
        <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
          <input
            className={inputStyle}
            type="email"
            placeholder="you@email.com"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
          />
          <button className={buttonStyle} type="submit">
            Send magic link
          </button>
        </form>
        {authMsg && <p className="mt-3">{authMsg}</p>}
      </main>
    );
  }

  return (
    <main
      className={clsx("p-6 max-w-3xl mx-auto", "mt-[var(--titlebar-height)]")}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="text-xl">Admin Users</h1>
          <div className="text-xs opacity-70">
            Signed in as <span className="underline">{session.user.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className={clsx(buttonStyle, "mt-0")} href="/admin">
            Upload
          </Link>
          <button className={clsx(buttonStyle, "mt-0")} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm opacity-75">
          Admin: {counts.ADMIN} • Trusted: {counts.TRUSTED} • Pending:{" "}
          {counts.PENDING}
        </div>

        <button
          className={clsx(buttonStyle, "mt-0")}
          type="button"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {status ? <div className="text-sm opacity-80 mb-3">{status}</div> : null}

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div
            key={u.userId}
            className={clsx(
              "border border-black/15 dark:border-white/10 rounded-md p-3",
              "flex flex-col gap-2",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {u.email ?? <span className="opacity-60">(no email)</span>}
                </div>
                <div className="text-xs opacity-60">
                  {u.userId} • {fmtDate(u.createdAt)}
                </div>
              </div>
              <RolePill role={u.role} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={clsx(buttonStyle, "mt-0 px-3 py-2")}
                disabled={u.role === "TRUSTED" || u.role === "ADMIN"}
                onClick={() => setRole(u.userId, "TRUSTED")}
                title="Allow this user to submit uploads (drafts)"
              >
                Promote {"->"} TRUSTED
              </button>

              <button
                type="button"
                className={clsx(buttonStyle, "mt-0 px-3 py-2")}
                disabled={u.role === "PENDING" || u.role === "ADMIN"}
                onClick={() => setRole(u.userId, "PENDING")}
                title="Remove trusted ability (keep account)"
              >
                Demote {"->"} PENDING
              </button>

              {u.role === "ADMIN" ? (
                <span className="text-xs opacity-60">
                  (Admins can’t be changed here)
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {!users.length && !loading ? (
          <div className="text-sm opacity-70">
            No profiles found yet. Users appear here after signing in at least
            once.
          </div>
        ) : null}
      </div>
    </main>
  );
}
