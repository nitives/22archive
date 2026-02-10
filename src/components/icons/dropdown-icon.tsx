"use client";
import { IoTriangleSharp } from "react-icons/io5";
import { motion } from "motion/react";

type DropdownProps = {
  active?: boolean;
  size?: number;
};

export const DropdownIcon = ({ active = false, size = 12 }: DropdownProps) => {
  return (
    <motion.span
      initial={false}
      className="touch-hitbox song-touch-hitbox"
      style={{
        translateY: "1px",
        cursor: "pointer",
      }}
      animate={{
        rotate: active ? "180deg" : "90deg",
        scaleY: active ? 0.8 : 1,
        scale: active ? 1.1 : 1,
      }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
    >
      <IoTriangleSharp size={size} />
    </motion.span>
  );
};
