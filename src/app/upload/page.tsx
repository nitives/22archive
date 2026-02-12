"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/client";

import { slugify } from "@/lib/strings";
import { STORAGE } from "@/conf/storage";
import { buttonStyle, inputStyle, textAreaStyle } from "@/styles/forms";
import {
  uploadSongSchema,
  type UploadSongFormValues,
} from "@/features/admin/uploadSong.schema";
import { FormField, ErrorMessage } from "@/components/upload/forms/form-field";
import { TextInput } from "@/components/upload/forms/controls";
import { QuickFillSourceButton } from "@/components/upload/quick-fill-source";
import { Spinner } from "@/components/spinner";

const meSchema = z.object({
  role: z.enum(["ADMIN", "TRUSTED", "PENDING"]),
  email: z.string().nullable(),
});

type Me = z.infer<typeof meSchema>;

const uploadDefaultValues: UploadSongFormValues = {
  title: "",
  artist: "2hollis",
  era: "",
  year: undefined,
  coverUrl: "",
  sourceName: "",
  sourceUrl: "",
  sourcePlatform: undefined,
  sourceDescription: "",
  producers: "",
  publish: false, // ignored anyway
};

export default function UploadPage() {
  const [session, setSession] =
    useState<
      Awaited<
        ReturnType<ReturnType<typeof supabaseBrowser>["auth"]["getSession"]>
      >["data"]["session"]
    >(null);

  // undefined = loading
  // null = failed to load / no profile
  // Me = loaded
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [authEmail, setAuthEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const supabase = useMemo(() => supabaseBrowser(), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    getValues,
  } = useForm<UploadSongFormValues>({
    resolver: zodResolver(uploadSongSchema),
    defaultValues: uploadDefaultValues,
  });

  const watchedArtist = watch("artist");
  const watchedTitle = watch("title");
  const slug = useMemo(
    () => slugify(`${watchedArtist}-${watchedTitle}`),
    [watchedArtist, watchedTitle],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) =>
      setSession(sess),
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    async function loadMe() {
      if (!session?.access_token) return;
      const res = await fetch("/api/me", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setMe(null);
        return;
      }
      const parsed = meSchema.safeParse(await res.json());
      if (!parsed.success) {
        setMe(null);
        return;
      }
      setMe(parsed.data);
    }
    void loadMe();
  }, [session?.access_token]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: `${location.origin}/upload` },
    });
    setAuthMsg(
      error ? `${error.message}` : "Check your email for the sign-in link.",
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const onSubmit: SubmitHandler<UploadSongFormValues> = async (values) => {
    setStatus("");

    try {
      if (!session) throw new Error("You must be signed in.");
      if (!me) throw new Error("Could not load your role.");
      if (me.role === "PENDING")
        throw new Error("Your account is pending approval.");
      if (!file) throw new Error("MP3 file is required.");

      const userId = session.user.id;
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const key = `${userId}/${slug || crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(STORAGE.TRACKS_BUCKET)
        .upload(key, file, {
          upsert: false,
          contentType: file.type || "audio/mpeg",
        });

      if (upErr) throw upErr;

      const token = session.access_token;

      const producers = (values.producers || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/upload/songs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          publish: false, // ignored server-side
          coverUrl: values.coverUrl || null,
          audioPath: key,
          producers,
        }),
      });

      if (!res.ok) {
        await supabase.storage.from(STORAGE.TRACKS_BUCKET).remove([key]);
        throw new Error((await res.text()) || `Failed: ${res.status}`);
      }

      setStatus("Uploaded for review (draft).");
      reset(uploadDefaultValues);
      setFile(null);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!session) {
    return (
      <main
        className={clsx("p-6 max-w-xl mx-auto", "mt-[var(--titlebar-height)]")}
      >
        <h1 className="text-xl mb-4">Login</h1>
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

  if (me === undefined) {
    return (
      <main
        className={clsx(
          "p-6 max-w-xl mx-auto",
          "flex items-center justify-center",
          "mt-[var(--titlebar-height)]",
        )}
      >
        <Spinner size="xl" />
      </main>
    );
  }

  if (me?.role === "PENDING") {
    return (
      <main
        className={clsx("p-6 max-w-xl mx-auto", "mt-[var(--titlebar-height)]")}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl">Uploader Access</h1>
          <button className={buttonStyle} onClick={signOut}>
            Sign out
          </button>
        </div>
        <p className="opacity-75 leading-relaxed">
          Your account is <strong>pending approval</strong>. Once an admin marks
          you as trusted, you’ll be able to upload drafts here.
        </p>
      </main>
    );
  }

  return (
    <main
      className={clsx("p-6 max-w-2xl mx-auto", "mt-[var(--titlebar-height)]")}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl">Upload (Draft)</h1>
        <button className={buttonStyle} onClick={signOut}>
          Sign out
        </button>
      </div>

      <p className="opacity-70 mb-4">
        Signed in as <span className="underline">{session.user.email}</span>
        <span className="opacity-60"> ({me?.role ?? "—"})</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FormField label="Title" required error={errors.title?.message}>
          <TextInput {...register("title")} />
        </FormField>

        <FormField label="Artist" required error={errors.artist?.message}>
          <TextInput {...register("artist")} />
        </FormField>

        <FormField label="MP3 file*">
          <input
            className={clsx(inputStyle, "cursor-pointer")}
            type="file"
            accept="audio/mpeg,audio/mp3"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </FormField>

        <FormField label="Source URL*" error={errors.sourceUrl?.message}>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <TextInput {...register("sourceUrl")} />
              {errors.sourceUrl && (
                <ErrorMessage message={errors.sourceUrl.message} />
              )}
            </div>
            <QuickFillSourceButton getValues={getValues} setValue={setValue} />
          </div>
        </FormField>

        <FormField label="Source name*" error={errors.sourceName?.message}>
          <TextInput {...register("sourceName")} />
        </FormField>

        <FormField
          label="Source description (optional)"
          error={errors.sourceDescription?.message}
        >
          <textarea
            className={textAreaStyle}
            {...register("sourceDescription")}
          />
        </FormField>

        <button className={buttonStyle} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload draft"}
        </button>

        {status && <p className="mt-3">{status}</p>}
      </form>
    </main>
  );
}
