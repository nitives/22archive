import clsx from "clsx";
import type { ComponentProps } from "react";
import { inputStyle, textAreaStyle } from "@/styles/forms";

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={clsx(inputStyle, props.className)} />;
}

export function SelectInput(props: ComponentProps<"select">) {
  return <select {...props} className={clsx(inputStyle, props.className)} />;
}

export function TextArea(props: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={clsx(textAreaStyle, props.className)} />
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 mt-2 select-none cursor-pointer">
      <input
        className="accent-neutral-400 dark:accent-neutral-700"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
