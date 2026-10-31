import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency: string = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-GH").format(num);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Normalize a phone number for international dialing (e.g., for wa.me, tel:, sms:)
 * - Strips spaces, dashes, parentheses
 * - For Ghanaian numbers starting with 0, converts to 233XXXXXXXXX
 * - For numbers starting with +, strips the +
 * - Returns digits only, suitable for wa.me and tel:/sms: URIs
 */
export function normalizePhone(phone: string | null | undefined, countryCode: string = "233"): string | null {
  if (!phone) return null;
  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");
  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }
  // Handle local Ghana format: 0XXXXXXXXX → 233XXXXXXXXX
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = countryCode + cleaned.slice(1);
  }
  // Handle 00 international prefix
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  // Validate: must be at least 7 digits
  if (cleaned.length < 7) return null;
  return cleaned;
}

/**
 * Build a WhatsApp link from a phone number and optional message
 */
export function whatsappLink(phone: string | null | undefined, message?: string, countryCode?: string): string | null {
  const normalized = normalizePhone(phone, countryCode);
  if (!normalized) return null;
  let url = `https://wa.me/${normalized}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  return url;
}

/**
 * Build an SMS link from a phone number and optional body
 */
export function smsLink(phone: string | null | undefined, body?: string, countryCode?: string): string | null {
  const normalized = normalizePhone(phone, countryCode);
  if (!normalized) return null;
  // Use "+" prefix for tel: format, sms: with body parameter
  let url = `sms:+${normalized}`;
  if (body) {
    // Cross-platform: use &body= (works on iOS and most Android)
    url += `&body=${encodeURIComponent(body)}`;
  }
  return url;
}

/**
 * Build a tel: link for phone calls
 */
export function telLink(phone: string | null | undefined, countryCode?: string): string | null {
  const normalized = normalizePhone(phone, countryCode);
  if (!normalized) return null;
  return `tel:+${normalized}`;
}

/**
 * Build a mailto: link with optional subject and body
 */
export function mailtoLink(email: string | null | undefined, subject?: string, body?: string): string | null {
  if (!email || !email.includes("@")) return null;
  let url = `mailto:${email}`;
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  return url;
}

/**
 * Build a Gmail compose link (opens Gmail in browser)
 */
export function gmailLink(email: string | null | undefined, subject?: string, body?: string): string | null {
  if (!email || !email.includes("@")) return null;
  let url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  if (subject) url += `&su=${encodeURIComponent(subject)}`;
  if (body) url += `&body=${encodeURIComponent(body)}`;
  return url;
}
