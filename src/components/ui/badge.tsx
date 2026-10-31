import { cn } from "@/lib/utils";
export function Badge({ className, variant='default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default'|'success'|'warning'|'danger'|'info' }) {
  const map: Record<string,string> = {
    default: "bg-stone-100 text-stone-700 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", map[variant], className)} {...props} />;
}
