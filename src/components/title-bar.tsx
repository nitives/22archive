import { APP } from "@/conf/constants";
import { clsx } from "clsx";
import Link from "next/link";
import { BiPlusMedical } from "react-icons/bi";
import { TitlebarActions } from "./titlebar-actions";

export const Titlebar = () => {
  return (
    <nav
      className={clsx(
        "w-full h-[40px]",
        "flex items-center justify-between",
        "fixed top-0 left-0 z-50",
        "px-2.5 py-2 bg-white dark:bg-black",
      )}
    >
      <Link href="/">
        <h1 className="select-none">{APP.NAME}</h1>
      </Link>
      {/* <BiPlusMedical /> */}
      <TitlebarActions />
    </nav>
  );
};
