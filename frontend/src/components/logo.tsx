import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Pixel size of the square logomark. */
  markSize?: number;
  /** Hide the wordmark and render the mark only. */
  markOnly?: boolean;
}

/**
 * Segmenta brand lockup: a clustered-dots logomark (evoking customer
 * segmentation / K-Means centroids) paired with an uppercase wordmark.
 */
export function Logo({ className, markSize = 36, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-primary", className)}>
      <LogoMark size={markSize} />
      {markOnly ? null : (
        <span className="text-[1.15rem] font-extrabold uppercase leading-none tracking-[0.18em] text-primary">
          Segment
          <span className="text-accent">a</span>
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[0.7rem] bg-primary text-[color:var(--primary-foreground)] shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        {/* Three clusters of points around centroids — a segmentation motif. */}
        <circle cx="6" cy="6.5" r="2.4" fill="currentColor" />
        <circle cx="11" cy="4.5" r="1.3" fill="currentColor" opacity="0.6" />
        <circle cx="4.5" cy="11" r="1.3" fill="currentColor" opacity="0.6" />

        <circle cx="18" cy="8" r="2.4" fill="var(--accent)" />
        <circle cx="19.5" cy="13" r="1.3" fill="var(--accent)" opacity="0.7" />
        <circle cx="14" cy="9" r="1.3" fill="var(--accent)" opacity="0.7" />

        <circle cx="11" cy="18.5" r="2.4" fill="currentColor" />
        <circle cx="6" cy="18" r="1.3" fill="currentColor" opacity="0.6" />
        <circle cx="16" cy="19.5" r="1.3" fill="currentColor" opacity="0.6" />
      </svg>
    </span>
  );
}
