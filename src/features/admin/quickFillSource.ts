import type { UploadSongFormValues } from "@/features/admin/uploadSong.schema";

type QuickFillResult = Partial<
  Pick<UploadSongFormValues, "title" | "sourceName" | "sourcePlatform">
>;

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function toTitleFromSlug(slug: string) {
  return slug
    .trim()
    .replace(/[-_]+/g, " ") // dashes/underscores -> spaces
    .replace(/\s+/g, " "); // collapse extra spaces
}

function cleanSoundcloudUser(user: string) {
  // remove trailing "-123456789" (exactly 9 digits) if present
  return user.replace(/-\d{9}$/, "");
}

export function quickFillFromSourceUrl(input: string): {
  ok: boolean;
  error?: string;
  data?: QuickFillResult;
} {
  const raw = (input || "").trim();
  if (!raw) return { ok: false, error: "Copy a source URL first." };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "That doesn’t look like a valid URL." };
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean).map(safeDecode);

  // --- SoundCloud ---
  // https://soundcloud.com/{username}/{trackSlug}
  if (host === "soundcloud.com") {
    const usernameRaw = pathParts[0];
    const username = cleanSoundcloudUser(usernameRaw);
    const trackSlug = pathParts[1];

    if (!username || !trackSlug) {
      return {
        ok: false,
        error: "SoundCloud link should look like /user/track.",
      };
    }

    return {
      ok: true,
      data: {
        sourcePlatform: "SoundCloud",
        sourceName: username,
        title: toTitleFromSlug(trackSlug),
      },
    };
  }

  // --- YouTube ---

  // --- Bandcamp ---

  // --- Spotify ---

  // --- Apple Music ---

  return {
    ok: true,
    data: {
      sourcePlatform: "Other",
    },
  };
}
