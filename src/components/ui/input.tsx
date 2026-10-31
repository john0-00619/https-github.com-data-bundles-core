import { cn } from "@/lib/utils";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full h-10 px-3.5 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900 transition", props.className)} {...props} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full min-h-[88px] px-3.5 py-3 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900 transition", props.className)} {...props} />;
}
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-semibold tracking-wide uppercase text-ink-700", props.className)} {...props} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("w-full h-10 px-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-ink-900", props.className)} {...props} />;
}
