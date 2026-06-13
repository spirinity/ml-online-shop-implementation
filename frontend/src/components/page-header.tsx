"use client";

import { Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Compact, content-first page header shared across routes.
 *
 * Renders the eyebrow + title and an optional action on a single row so the
 * main content sits near the top of the viewport. The longer description is
 * demoted behind an info toggle instead of always occupying vertical space.
 */
export function PageHeader({ title, eyebrow, description, action, className }: PageHeaderProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <header className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            {eyebrow ? (
              <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="truncate text-xl font-semibold leading-tight text-primary sm:text-2xl">{title}</h1>
          </div>
          {description ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              aria-label={showDescription ? "Sembunyikan keterangan halaman" : "Tampilkan keterangan halaman"}
              aria-expanded={showDescription}
              onClick={() => setShowDescription((value) => !value)}
            >
              <Info
                size={16}
                aria-hidden="true"
                className={cn(
                  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  showDescription ? "rotate-180 text-primary" : "rotate-0",
                )}
              />
            </Button>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </div>
      {description ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showDescription ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <p
              className={cn(
                "max-w-3xl text-sm leading-6 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showDescription ? "translate-y-0" : "-translate-y-1",
              )}
            >
              {description}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
