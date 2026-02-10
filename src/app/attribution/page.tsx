// src/app/attribution/page.tsx
import clsx from "clsx";
import { APP } from "@/conf/constants";
import Link from "next/link";

const CREDITS: Array<{
  name: string;
  role?: string;
  note?: string;
  links?: Array<{ label: string; href: string }>;
}> = [
  // Edit these however you want
  { name: "2hollis", role: "Artist / Original work" },
  // { name: "someone", role: "Uploader", links: [{ label: "SoundCloud", href: "https://soundcloud.com/..." }] },
];

export default async function AttributionPage() {
  return (
    <main
      className={clsx(
        "flex flex-col items-center justify-start",
        "min-h-[calc(100dvh-var(--titlebar-height))] mt-[var(--titlebar-height)]",
        "px-5 py-8",
      )}
    >
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-xl">Attribution & Disclaimer</h1>
          <p className="opacity-75">
            {APP.NAME} is a fan-made archive / index. It is not an official
            site.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-base">Not affiliated</h2>
          <p className="opacity-80 leading-relaxed">
            This website is not affiliated with, endorsed by, or sponsored by{" "}
            <strong>2hollis</strong>, <strong>Interscope Records</strong>, or
            any other label, management, publisher, or partner. Any artist
            names, logos, and trademarks belong to their respective owners.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base">Ownership & content</h2>
          <p className="opacity-80 leading-relaxed">
            The audio and related media referenced here are the property of
            their respective copyright holders. I do not claim ownership over
            any music, cover art, videos, or other third-party materials that
            may appear on this site. This site is intended for archival /
            informational purposes.
          </p>
          <p className="opacity-80 leading-relaxed">
            Where possible, this site links back to original sources. If you are
            a rights holder and would like content removed or access disabled,
            please contact me and I will take it down as quickly as possible.
          </p>

          {/* Replace this with your preferred contact method */}
          <div
            className={clsx(
              "mt-1",
              "border border-black/15 dark:border-white/10",
              "rounded-md",
              "p-3",
            )}
          >
            <div className="text-sm opacity-70">Takedown / Contact</div>
            <div className="mt-1 text-sm">
              Email:{" "}
              <Link
                className="underline opacity-90"
                href={`mailto:${APP.AUTHOR.EMAIL}`}
              >
                {APP.AUTHOR.EMAIL}
              </Link>
            </div>
            <div className="mt-1 text-xs opacity-65">
              Please include: the track name, the link on this site, and proof
              you’re the rights holder (or representing them).
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base">Credits</h2>
          <p className="opacity-75 leading-relaxed">
            Shoutouts / credits for sources, uploaders, editors, and anyone who
            helped organize information.
          </p>

          <div className="flex flex-col gap-2">
            {CREDITS.map((c) => (
              <div
                key={c.name}
                className={clsx(
                  "border border-black/15 dark:border-white/10",
                  "rounded-md",
                  "p-3",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-medium">{c.name}</div>
                  {c.role ? (
                    <div className="text-xs opacity-65">{c.role}</div>
                  ) : null}
                </div>

                {c.note ? (
                  <div className="text-sm opacity-75 mt-1">{c.note}</div>
                ) : null}

                {c.links?.length ? (
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {c.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline opacity-80 hover:opacity-100"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {!CREDITS.length ? (
              <div className="text-sm opacity-70">
                Add entries to <code>CREDITS</code> in this file to show them
                here.
              </div>
            ) : null}
          </div>
        </section>

        <footer className="pt-2 text-xs opacity-60">
          © {new Date().getFullYear()} {APP.NAME}. All rights belong to their
          respective owners.
        </footer>
      </div>
    </main>
  );
}
