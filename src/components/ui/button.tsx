import { cn } from "@/lib/utils";
import React from "react";
export function Button({ className, variant='primary', size='md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'outline'|'danger', size?: 'sm'|'md'|'lg'|'icon' }) {
  const base = "inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-kingdom-500";
  const variants: Record<string,string> = {
    primary: "bg-ink-900 text-white hover:bg-black shadow-soft rounded-full",
    secondary: "bg-white border border-stone-200 text-ink-900 hover:bg-stone-50 rounded-full",
    ghost: "bg-transparent text-ink-700 hover:bg-stone-100 rounded-full",
    outline: "bg-white border border-stone-200 text-ink-800 hover:bg-stone-50 rounded-xl",
    danger: "bg-red-600 text-white hover:bg-red-700 rounded-full",
  };
  const sizes: Record<string,string> = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-11 px-7 text-sm",
    icon: "h-9 w-9",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
