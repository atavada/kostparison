"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const baseInput =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 " +
  "transition-shadow";

// --- Field wrapper dengan label + pesan error ---

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, required, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// --- Input text biasa ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={[
        baseInput,
        error ? "border-red-400 focus:ring-red-400" : "",
        className,
      ].join(" ")}
      {...props}
    />
  )
);
Input.displayName = "Input";

// --- Textarea ---

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={[
        baseInput,
        "resize-y min-h-[80px]",
        error ? "border-red-400 focus:ring-red-400" : "",
        className,
      ].join(" ")}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
