"use client";

import { useState } from "react";
import clsx from "clsx";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { UploadSongFormValues } from "@/features/admin/uploadSong.schema";
import { quickFillFromSourceUrl } from "@/features/admin/quickFillSource";
import { buttonStyle } from "@/styles/forms";

async function readClipboardTextSafe(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null;
    const text = await navigator.clipboard.readText();
    return (text || "").trim() || null;
  } catch {
    // Clipboard can fail if not HTTPS, no permission, or no user gesture
    return null;
  }
}

export function QuickFillSourceButton({
  getValues,
  setValue,
}: {
  getValues: UseFormGetValues<UploadSongFormValues>;
  setValue: UseFormSetValue<UploadSongFormValues>;
}) {
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function apply() {
    setMsg("");
    setLoading(true);

    // 1) Prefer clipboard
    const clip = await readClipboardTextSafe();

    // 2) Fallback to whatever is already in the input
    const existing = (getValues("sourceUrl") || "").trim();
    const url = clip ?? existing;

    if (!url) {
      setLoading(false);
      setMsg("Paste a link in your clipboard (or the Source URL field) first.");
      return;
    }

    // If clipboard had something, push it into the form field
    if (clip && clip !== existing) {
      setValue("sourceUrl", clip, { shouldValidate: true, shouldDirty: true });
    }

    const res = quickFillFromSourceUrl(url);

    if (!res.ok) {
      setLoading(false);
      setMsg(res.error || "Couldn’t parse link.");
      return;
    }

    const data = res.data || {};

    // Only fill fields if empty (don’t overwrite the edits)
    const curTitle = (getValues("title") || "").trim();
    const curArtist = (getValues("artist") || "").trim();
    const curSourceName = (getValues("sourceName") || "").trim();
    const curPlatform = getValues("sourcePlatform");

    if (!curTitle && data.title) {
      setValue("title", data.title, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (!curArtist) {
      setValue("artist", "2hollis", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (!curSourceName && data.sourceName) {
      setValue("sourceName", data.sourceName, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (!curPlatform && data.sourcePlatform) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue("sourcePlatform", data.sourcePlatform as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    const filled = [
      !existing && clip ? "source url" : null,
      !curTitle && data.title ? "title" : null,
      !curArtist ? "artist" : null,
      !curSourceName && data.sourceName ? "source name" : null,
      !curPlatform && data.sourcePlatform ? "platform" : null,
    ].filter(Boolean);

    setMsg(
      filled.length
        ? `Filled: ${filled.join(", ")}`
        : "Detected link type (nothing to overwrite).",
    );

    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-1 pb-3">
      <button
        type="button"
        onClick={apply}
        disabled={loading}
        className={clsx(buttonStyle, "mt-0 px-3 py-2 disabled:opacity-50")}
        title="Reads the URL from your clipboard and fills fields"
      >
        {loading ? "Reading..." : "Quick fill"}
      </button>

      {msg ? <div className="text-xs opacity-70">{msg}</div> : null}
    </div>
  );
}
