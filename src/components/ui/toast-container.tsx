import { useToasts, dismissToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const variantStyles = {
  default: "border-l-border",
  success: "border-l-green-500",
  destructive: "border-l-destructive",
};

export function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-md border border-l-4 bg-card px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 ${variantStyles[toast.variant]}`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-2 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  );
}
