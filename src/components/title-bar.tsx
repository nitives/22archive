import { APP } from "@/conf/constants";
import { clsx } from "clsx";
import Link from "next/link";
import { BiPlusMedical } from "react-icons/bi";

export const Titlebar = () => {
  return (
    <nav
      className={clsx(
        "w-full",
        "flex items-center justify-between",
        "fixed top-0 left-0 z-50",
        "px-2.5 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm",
      )}
    >
      <Link href="/">
        <h1 className="select-none">{APP.NAME}</h1>
      </Link>
      <BiPlusMedical />
    </nav>
  );
};
