import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function maskKey(key: string) {
  if (!key || key.length < 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}
export function formatNumber(n: number) { return new Intl.NumberFormat().format(n); }
export function formatCurrency(n: number) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n); }
