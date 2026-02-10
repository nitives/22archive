import clsx from "clsx";
import type { ReactNode } from "react";

type BaseProps = {
  label: ReactNode;
  required?: boolean;
  error?: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required,
  error,
  description,
  className,
  children,
}: BaseProps) {
  return (
    <label className={clsx("flex flex-col gap-1", className)}>
      <div className="flex items-baseline gap-1">
        <span>{label}</span>
        {required ? <span className="opacity-60">*</span> : null}
      </div>

      {children}

      {description ? <p className="text-sm opacity-70">{description}</p> : null}

      {error ? <ErrorMessage message={error} /> : null}
    </label>
  );
}

export const ErrorMessage = ({ message }: { message: string | undefined }) => {
  if (!message) return null;
  return <span className="text-red-400 text-sm">{message}</span>;
};
