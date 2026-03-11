import React from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "dashed";

const BASE =
  "btn-font transition-colors duration-fast disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-content-primary text-base-bg font-bold px-8 py-4 hover:bg-content-secondary disabled:opacity-50",
  secondary:
    "px-3 py-2 border border-layer-muted text-layer-medium hover:bg-layer-faint disabled:opacity-50",
  outline:
    "px-3 py-2 border border-layer-muted hover:bg-layer-faint disabled:opacity-50",
  ghost: "",
  dashed:
    "w-full border border-dashed border-base-border text-layer-medium hover:text-content-primary hover:border-content-primary hover:bg-layer-faint disabled:opacity-50",
};

export function buttonClass(variant: ButtonVariant = "ghost", className = "") {
  return twMerge(BASE, VARIANTS[variant], className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
