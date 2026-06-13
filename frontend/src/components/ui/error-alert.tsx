"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  /** The error message. Falsy hides the alert with an exit animation. */
  message?: string | null;
  onDismiss?: () => void;
}

/**
 * Dismissible destructive alert for recoverable errors (Nielsen heuristic #9).
 *
 * Stays mounted and animates its own enter/exit (height collapse + fade + slide)
 * so showing/hiding is smooth and the content below doesn't jump instantly.
 * Retains the last message during the exit transition.
 */
export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  const open = Boolean(message);
  // Retain the last non-empty message so it stays visible while collapsing out.
  // Setting state during render (with a guard) is the React-sanctioned way to
  // derive state from props without an effect.
  const [shown, setShown] = useState(message ?? "");
  if (message && message !== shown) setShown(message);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // When closed, force margin-top to 0 so the parent's `space-y-*` rhythm
        // doesn't leave a phantom gap above the collapsed (zero-height) alert.
        open ? "grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-y-0" : "-translate-y-1",
          )}
        >
          <Alert className="relative border-destructive/25 bg-destructive/10 pr-12 text-destructive" variant="destructive">
            <AlertDescription className="text-destructive">{shown}</AlertDescription>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Tutup pesan error"
                tabIndex={open ? 0 : -1}
                className="absolute top-2.5 right-3 grid size-6 place-items-center rounded-full text-destructive transition-colors hover:bg-destructive/15"
              >
                <X size={15} aria-hidden="true" />
              </button>
            ) : null}
          </Alert>
        </div>
      </div>
    </div>
  );
}
