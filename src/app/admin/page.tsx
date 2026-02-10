"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { AdminHeader } from "@/components/admin/header";
import { slugify } from "@/lib/strings";
import { buttonStyle, inputStyle, textAreaStyle } from "@/styles/forms";
import { STORAGE } from "@/conf/storage";
import {
  uploadSongSchema,
  type UploadSongFormValues,
} from "@/features/admin/uploadSong.schema";
import { ErrorMessage, FormField } from "@/components/admin/forms/form-field";
import {
  TextInput,
  SelectInput,
  TextArea,
  CheckboxField,
} from "@/components/admin/forms/controls";

export default function AdminPage() {
  const [session, setSession] =
    useState<
      Awaited<
        ReturnType<typeof supabaseBrowser.auth.getSession>
      >["data"]["session"]
    >(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<UploadSongFormValues>({
    resolver: zodResolver(uploadSongSchema),
    defaultValues: {
      title: "",
      artist: "",
      era: "",
      year: undefined,
      coverUrl: "",
      sourceName: "",
      sourceUrl: "",
      sourcePlatform: undefined,
      sourceDescription: "",
      producers: "",
      publish: true,
    },
  });

  const watchedTitle = watch("title");
  const watchedArtist = watch("artist");

  const slug = useMemo(
    () => slugify(`${watchedArtist}-${watchedTitle}`),
    [watchedArtist, watchedTitle],
  );

  useEffect(() => {
    supabaseBrowser.auth
      .getSession()
      .then(({ data }) => setSession(data.session));
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(
      (_evt, sess) => {
        setSession(sess);
      },
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthMsg("");
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: `${location.origin}/admin` },
    });
    if (error) setAuthMsg(`❌ ${error.message}`);
    else setAuthMsg("✅ Check your email for the sign-in link.");
  }

  async function signOut() {
    await supabaseBrowser.auth.signOut();
  }

  const onSubmit: SubmitHandler<UploadSongFormValues> = async (values) => {
    setStatus("");

    try {
      if (!session) throw new Error("You must be signed in.");
      if (!file) throw new Error("MP3 file is required.");

      const userId = session.user.id;
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const key = `${userId}/${slug || crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabaseBrowser.storage
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

      const res = await fetch("/api/admin/songs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          coverUrl: values.coverUrl || null,
          audioPath: key,
          producers,
        }),
      });

      if (!res.ok) {
        // cleanup orphaned upload
        await supabaseBrowser.storage.from(STORAGE.TRACKS_BUCKET).remove([key]);
        const msg = await res.text();
        throw new Error(msg || `Failed: ${res.status}`);
      }

      setStatus("✅ Uploaded and saved!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reset({ publish: true } as any);
      setFile(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setStatus(message);
    }
  };

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
      className={clsx("p-6 max-w-2xl mx-auto", "mt-[var(--titlebar-height)]")}
    >
      <AdminHeader signOut={signOut} />

      <p className="opacity-70 mb-4">
        Signed in as <span className="underline">{session.user.email}</span>
      </p>

      <p className="opacity-70 mb-4">
        Slug preview: <code>{slug || "(fill title + artist)"}</code>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FormField label="Title" required error={errors.title?.message}>
          <TextInput {...register("title")} />
        </FormField>

        <FormField label="Artist" required error={errors.artist?.message}>
          <TextInput {...register("artist")} />
        </FormField>

        <div className="flex gap-3">
          <FormField className="flex-1" label="Era" error={errors.era?.message}>
            <TextInput {...register("era")} />
          </FormField>

          <FormField label="Year" error={errors.year?.message}>
            <TextInput type="number" {...register("year")} />
          </FormField>
        </div>

        <FormField
          label="Cover URL (optional)"
          error={errors.coverUrl?.message}
        >
          <TextInput {...register("coverUrl")} />
          {errors.coverUrl && (
            <ErrorMessage message={errors.coverUrl.message} />
          )}
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

        <hr className="border-white/10 my-2" />

        <FormField
          label="Producers (comma separated)"
          error={errors.producers?.message}
        >
          <TextInput
            placeholder="2hollis, someone else"
            {...register("producers")}
          />
        </FormField>

        <FormField label="Source name*" error={errors.sourceName?.message}>
          <TextInput {...register("sourceName")} />
          {errors.sourceName && (
            <ErrorMessage message={errors.sourceName.message} />
          )}
        </FormField>

        <FormField label="Source URL*" error={errors.sourceUrl?.message}>
          <TextInput {...register("sourceUrl")} />
          {errors.sourceUrl && (
            <ErrorMessage message={errors.sourceUrl.message} />
          )}
        </FormField>

        <FormField
          label="Source platform"
          error={errors.sourcePlatform?.message}
        >
          <select className={inputStyle} {...register("sourcePlatform")}>
            <option value="">(none)</option>
            <option value="SoundCloud">SoundCloud</option>
            <option value="YouTube">YouTube</option>
            <option value="Bandcamp">Bandcamp</option>
            <option value="Spotify">Spotify</option>
            <option value="AppleMusic">Apple Music</option>
            <option value="Other">Other</option>
          </select>
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

        <CheckboxField
          label="Publish immediately"
          checked={!!watch("publish")}
          onChange={(next) => setValue("publish", next)}
        />
        {errors.publish?.message && (
          <ErrorMessage message={errors.publish.message} />
        )}

        <button className={buttonStyle} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload"}
        </button>

        {status && <p className="mt-3">{status}</p>}
      </form>
    </main>
  );
}
