"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
} as const;

type ToastTone = keyof typeof ICONS;

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => {
    const tone = (toast.type as ToastTone) in ICONS ? (toast.type as ToastTone) : "info";
    const Icon = ICONS[tone];
    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "absolute right-0 bottom-0 left-auto z-(--toast-index) mb-0 w-[calc(100vw-2rem)] max-w-sm select-none rounded-[14px] border border-border bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
          "[transform:translateY(calc(var(--toast-offset-y)*-1+var(--toast-index)*-0.75rem))_scale(calc(1-(var(--toast-index)*0.04)))] [transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),opacity_0.3s] after:absolute after:bottom-full after:left-0 after:h-[calc(0.75rem+1px)] after:w-full after:content-['']",
          "data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)*-1))]",
          "data-[starting-style]:[transform:translateY(150%)] data-[ending-style]:opacity-0 data-[ending-style]:[transform:translateY(150%)]",
        )}
        swipeDirection={["right", "down"]}
      >
        <div className="flex items-start gap-3 pr-5">
          <Icon
            size={18}
            aria-hidden="true"
            className={cn(
              "mt-0.5 shrink-0",
              tone === "success" ? "text-accent" : tone === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          />
          <div className="min-w-0 flex-1">
            <ToastPrimitive.Title className="text-sm font-semibold text-primary" />
            <ToastPrimitive.Description className="mt-0.5 text-sm leading-5 text-muted-foreground" />
          </div>
        </div>
        <ToastPrimitive.Close
          aria-label="Tutup notifikasi"
          className="absolute top-3 right-3 grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <X size={15} aria-hidden="true" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    );
  });
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-50 mx-auto flex w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:bottom-6">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

/** Thin wrapper around the Base UI toast manager with tone-typed helpers. */
export function useToast() {
  const manager = ToastPrimitive.useToastManager();
  return {
    success: (title: string, description?: string) => manager.add({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      manager.add({ title, description, type: "error", priority: "high", timeout: 8000 }),
    info: (title: string, description?: string) => manager.add({ title, description, type: "info" }),
  };
}
