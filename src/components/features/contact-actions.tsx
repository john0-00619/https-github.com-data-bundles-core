"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Phone, Mail, MessageSquare, MoreHorizontal, Copy, Check, ExternalLink } from "lucide-react";
import { whatsappLink, smsLink, telLink, mailtoLink, gmailLink, normalizePhone } from "@/lib/utils";

interface ContactActionsProps {
  phone?: string | null;
  email?: string | null;
  name?: string;
  orgName?: string;
  /** Compact mode: shows icons only in a row */
  compact?: boolean;
  /** Show as dropdown menu instead of inline buttons */
  menu?: boolean;
  /** Context for message templates */
  context?: "visitor_followup" | "event_invite" | "meeting_reminder" | "pastoral" | "general";
  /** Country code for phone normalization */
  countryCode?: string;
}

const templates: Record<string, (name: string, org: string) => string> = {
  visitor_followup: (name, org) =>
    `Hi ${name}! Thank you for visiting ${org}. We'd love to have you back. Let us know if there's anything we can do for you. God bless! 🙏`,
  event_invite: (name, org) =>
    `Hi ${name}! You're warmly invited to our upcoming event at ${org}. We'd love to see you there! 🎉`,
  meeting_reminder: (name, org) =>
    `Hi ${name}! This is a friendly reminder about our upcoming meeting at ${org}. See you there!`,
  pastoral: (name, org) =>
    `Hi ${name}, we're reaching out from ${org} to check in on you. We're praying for you and here if you need anything. God bless!`,
  general: (name, org) =>
    `Hi ${name}! Greetings from ${org}. We hope you're doing well!`,
};

function getMessageTemplate(context: string | undefined, name: string, org: string): string {
  if (!context) return "";
  const fn = templates[context] || templates.general;
  return fn(name, org);
}

export function ContactActions({
  phone,
  email,
  name = "there",
  orgName = "our church",
  compact = false,
  menu = false,
  context,
  countryCode = "233",
}: ContactActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedPhone = normalizePhone(phone, countryCode);
  const hasPhone = !!normalizedPhone;
  const hasEmail = !!email && email.includes("@");
  const hasContact = hasPhone || hasEmail;

  if (!hasContact) {
    return (
      <span className="text-xs text-gray-400 italic">No contact info</span>
    );
  }

  const message = getMessageTemplate(context, name, orgName);
  const waLink = hasPhone ? whatsappLink(phone, message, countryCode) : null;
  const sms = hasPhone ? smsLink(phone, message, countryCode) : null;
  const tel = hasPhone ? telLink(phone, countryCode) : null;
  const mailto = hasEmail ? mailtoLink(email, `Hello from ${orgName}`, `Dear ${name},\n\n`) : null;
  const gmail = hasEmail ? gmailLink(email, `Hello from ${orgName}`, `Dear ${name},\n\n`) : null;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  // Dropdown menu mode
  if (menu) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Contact options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1 animate-fade-in">
            {hasPhone && waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>
                <WhatsappIcon className="h-4 w-4" />
                <span className="text-gray-700">WhatsApp</span>
              </a>
            )}
            {hasPhone && sms && (
              <a href={sms} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700">Send SMS</span>
              </a>
            )}
            {hasPhone && tel && (
              <a href={tel} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">Call</span>
              </a>
            )}
            {hasPhone && (
              <button onClick={() => { handleCopy(phone || "", "phone"); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm w-full text-left">
                {copied === "phone" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                <span className="text-gray-700">Copy Phone</span>
              </button>
            )}
            {hasPhone && hasEmail && <div className="border-t border-gray-100 my-1" />}
            {hasEmail && gmail && (
              <a href={gmail} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>
                <Mail className="h-4 w-4 text-red-500" />
                <span className="text-gray-700">Gmail</span>
              </a>
            )}
            {hasEmail && mailto && (
              <a href={mailto} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Email App</span>
              </a>
            )}
            {hasEmail && (
              <button onClick={() => { handleCopy(email || "", "email"); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm w-full text-left">
                {copied === "email" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                <span className="text-gray-700">Copy Email</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Compact mode: small icon buttons in a row
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {hasPhone && waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
            title="Open WhatsApp"
            aria-label="WhatsApp"
          >
            <WhatsappIcon className="h-4 w-4" />
          </a>
        )}
        {hasPhone && sms && (
          <a
            href={sms}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
            title="Send SMS"
            aria-label="SMS"
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        )}
        {hasPhone && tel && (
          <a
            href={tel}
            className="p-1.5 rounded-lg hover:bg-green-50 text-green-700 transition-colors"
            title="Call"
            aria-label="Call"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
        {hasEmail && mailto && (
          <a
            href={mailto}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            title="Send Email"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  // Full mode: labeled buttons
  return (
    <div className="flex flex-wrap gap-2">
      {hasPhone && waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
        >
          <WhatsappIcon className="h-4 w-4" />
          WhatsApp
        </a>
      )}
      {hasPhone && sms && (
        <a
          href={sms}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </a>
      )}
      {hasPhone && tel && (
        <a
          href={tel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
      )}
      {hasEmail && gmail && (
        <a
          href={gmail}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors"
        >
          <Mail className="h-4 w-4" />
          Gmail
        </a>
      )}
      {hasEmail && mailto && (
        <a
          href={mailto}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Email App
        </a>
      )}
    </div>
  );
}

/** WhatsApp SVG icon (not in lucide-react) */
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
