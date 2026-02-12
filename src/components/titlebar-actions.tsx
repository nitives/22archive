"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { BiPlusMedical } from "react-icons/bi";

type ActionLink = {
  label: string;
  href: string;
  external?: boolean;
};

export function TitlebarActions({ links }: { links?: ActionLink[] }) {
  const [open, setOpen] = useState(false);

  const items = useMemo<ActionLink[]>(
    () =>
      links ?? [
        { label: "Home", href: "/" },
        { label: "Admin", href: "/admin" },
        { label: "Attribution", href: "/attribution" },
      ],
    [links],
  );

  // Prevent background scroll on mobile overlay
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="relative flex items-center">
      {/* Desktop */}
      <div className="hidden sm:flex items-center">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="rail"
              initial={{ opacity: 0, x: 10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className={clsx(
                "mr-2",
                "flex items-center gap-2",
                "px-2 py-1",
                "bg-white dark:bg-black",
                "rounded-md",
              )}
            >
              {items.map((it) =>
                it.external ? (
                  <a
                    key={it.href}
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline opacity-80 hover:opacity-100"
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </a>
                ) : (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="text-sm underline opacity-80 hover:opacity-100"
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </Link>
                ),
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Mobile - fullscreen menu overlay */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="overlay"
            className="sm:hidden fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className={clsx(
                "absolute inset-0",
                "bg-white dark:bg-black",
                "pt-16 px-5",
              )}
            >
              <div className="flex flex-col gap-4">
                {items.map((it) =>
                  it.external ? (
                    <a
                      key={it.href}
                      href={it.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg underline"
                      onClick={() => setOpen(false)}
                    >
                      {it.label}
                    </a>
                  ) : (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="text-lg underline"
                      onClick={() => setOpen(false)}
                    >
                      {it.label}
                    </Link>
                  ),
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* The Plus button (rotates) */}
      <motion.button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "p-1",
          "rounded-md",
          "touch-hitbox",
          "relative z-[70]", // above overlay panel
          "cursor-pointer",
        )}
        initial={false}
        animate={{ rotate: open ? 45 : 0, translateY: open ? "0px" : " 0" }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
      >
        <BiPlusMedical />
      </motion.button>
    </div>
  );
}
