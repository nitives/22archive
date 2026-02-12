import clsx from "clsx";

export default async function Maintenance() {
  return (
    <div
      className={clsx(
        "text-center select-none",
        "flex flex-col items-center justify-center",
        "min-h-[calc(100dvh-var(--titlebar-height))] mt-[var(--titlebar-height)] mb-[15dvh]",
      )}
    >
      22archive is currently undergoing maintenance. Please check back later.
    </div>
  );
}
