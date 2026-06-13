import { cn } from "@/lib/utils";

type ProductVisualProps = {
  stockCode: string;
  description: string;
  className?: string;
};

type ProductKind =
  | "star-holder"
  | "polka-warmer"
  | "bird-ornament"
  | "lantern"
  | "union-warmer"
  | "bedroom"
  | "heart-holder"
  | "red-hottie"
  | "coat-hanger"
  | "kitchen"
  | "nesting-boxes"
  | "union-hottie";

const PRODUCT_KIND_BY_STOCK: Record<string, ProductKind> = {
  "21730": "star-holder",
  "22632": "polka-warmer",
  "84879": "bird-ornament",
  "71053": "lantern",
  "22633": "union-warmer",
  "22745": "bedroom",
  "85123A": "heart-holder",
  "84029E": "red-hottie",
  "84406B": "coat-hanger",
  "22748": "kitchen",
  "22752": "nesting-boxes",
  "84029G": "union-hottie",
};

const THEMES: Record<ProductKind, { from: string; to: string; accent: string }> = {
  "star-holder": { from: "#e8f6fb", to: "#c7e9f7", accent: "#2b8fb8" },
  "polka-warmer": { from: "#fff0f1", to: "#ffd0d6", accent: "#d43d4f" },
  "bird-ornament": { from: "#edf7f8", to: "#d5edf1", accent: "#178c9b" },
  lantern: { from: "#eef5f9", to: "#d7e7f1", accent: "#496778" },
  "union-warmer": { from: "#eef4ff", to: "#cfdcf7", accent: "#224d96" },
  bedroom: { from: "#f4efff", to: "#ddd2fb", accent: "#7b5bb6" },
  "heart-holder": { from: "#fff4f5", to: "#ffdce1", accent: "#c2455f" },
  "red-hottie": { from: "#fff0ec", to: "#ffcfc5", accent: "#c74636" },
  "coat-hanger": { from: "#fff7ed", to: "#f7ddba", accent: "#a86a2b" },
  kitchen: { from: "#eff9f4", to: "#cfeada", accent: "#2e8f67" },
  "nesting-boxes": { from: "#fff4df", to: "#f6d08c", accent: "#b8672f" },
  "union-hottie": { from: "#eef4ff", to: "#cedbf5", accent: "#2453a0" },
};

function productKind(stockCode: string, description: string): ProductKind {
  const direct = PRODUCT_KIND_BY_STOCK[stockCode.toUpperCase()];
  if (direct) return direct;

  const value = description.toLowerCase();
  if (value.includes("lantern")) return "lantern";
  if (value.includes("bird")) return "bird-ornament";
  if (value.includes("kitchen")) return "kitchen";
  if (value.includes("bedroom")) return "bedroom";
  if (value.includes("babushka") || value.includes("nesting")) return "nesting-boxes";
  if (value.includes("union") && value.includes("bottle")) return "union-hottie";
  if (value.includes("union")) return "union-warmer";
  if (value.includes("hottie") || value.includes("water bottle")) return "red-hottie";
  if (value.includes("hanger")) return "coat-hanger";
  if (value.includes("heart")) return "heart-holder";
  if (value.includes("warmer")) return "polka-warmer";
  return "star-holder";
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function Background({ id, kind }: { id: string; kind: ProductKind }) {
  const theme = THEMES[kind];
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill={`url(#${id}-bg)`} />
      <circle cx="128" cy="30" r="44" fill="#ffffff" opacity="0.38" />
      <circle cx="30" cy="126" r="52" fill="#ffffff" opacity="0.24" />
    </>
  );
}

function UnionJack({ id, x, y, width, height }: { id: string; x: number; y: number; width: number; height: number }) {
  const clipId = `${id}-union-clip-${x}-${y}`;

  return (
    <g clipPath={`url(#${clipId})`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} rx="10" />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="#234f9c" />
      <path d={`M${x} ${y} L${x + width} ${y + height} M${x + width} ${y} L${x} ${y + height}`} stroke="#fff" strokeWidth="13" />
      <path d={`M${x} ${y} L${x + width} ${y + height} M${x + width} ${y} L${x} ${y + height}`} stroke="#d9414d" strokeWidth="6" />
      <rect x={x + width / 2 - 8} y={y} width="16" height={height} fill="#fff" />
      <rect x={x} y={y + height / 2 - 8} width={width} height="16" fill="#fff" />
      <rect x={x + width / 2 - 4} y={y} width="8" height={height} fill="#d9414d" />
      <rect x={x} y={y + height / 2 - 4} width={width} height="8" fill="#d9414d" />
    </g>
  );
}

function Illustration({ id, kind, accent }: { id: string; kind: ProductKind; accent: string }) {
  const shadow = `url(#${id}-shadow)`;

  switch (kind) {
    case "polka-warmer":
      return (
        <g filter={shadow}>
          <rect x="47" y="35" width="66" height="92" rx="22" fill="#d94759" />
          <path d="M58 36 C58 23 102 23 102 36" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          {[61, 80, 99].map((cx, row) =>
            [55, 78, 101].map((cy, index) => <circle cx={cx + ((row + index) % 2) * 5} cy={cy} r="4" fill="#fff6f6" key={`${cx}-${cy}`} />),
          )}
          <path d="M58 116 C70 126 91 126 102 116" fill="none" stroke="#a92e3e" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "bird-ornament":
      return (
        <g filter={shadow}>
          <path d="M83 31 V53" stroke="#596875" strokeWidth="3" strokeLinecap="round" />
          <circle cx="83" cy="58" r="7" fill="#f0c85a" />
          <path d="M46 91 C49 61 82 49 111 66 C125 75 119 105 96 113 C70 122 42 113 46 91Z" fill="#2aa6aa" />
          <path d="M78 79 C91 76 102 84 105 98 C92 104 80 99 73 87Z" fill="#f07e57" />
          <path d="M110 70 L128 62 L116 78Z" fill="#d95a3d" />
          <circle cx="96" cy="68" r="3" fill="#17343a" />
          <path d="M52 97 C64 102 78 103 92 99" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case "lantern":
      return (
        <g filter={shadow}>
          <path d="M58 45 C58 24 102 24 102 45" fill="none" stroke="#506b78" strokeWidth="7" strokeLinecap="round" />
          <rect x="52" y="45" width="56" height="76" rx="9" fill="#f8fbfc" stroke="#496778" strokeWidth="5" />
          <path d="M65 58 H95 V108 H65Z" fill="#dcecf2" stroke="#86a6b6" strokeWidth="3" />
          <path d="M80 76 C91 89 90 104 80 105 C70 103 70 88 80 76Z" fill="#f5b84b" />
          <rect x="59" y="120" width="42" height="8" rx="4" fill="#496778" />
        </g>
      );
    case "union-warmer":
      return (
        <g filter={shadow}>
          <rect x="48" y="36" width="64" height="90" rx="21" fill="#f5f7fb" />
          <UnionJack id={id} x={52} y={43} width={56} height={72} />
          <path d="M61 36 C61 25 99 25 99 36" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "bedroom":
      return (
        <g filter={shadow}>
          <path d="M38 60 L80 34 L122 60 V124 H38Z" fill="#f5eefe" stroke="#7b5bb6" strokeWidth="4" />
          <rect x="51" y="53" width="22" height="20" rx="3" fill="#d9c8ff" />
          <rect x="47" y="88" width="68" height="25" rx="5" fill="#ffffff" />
          <rect x="47" y="101" width="68" height="16" rx="5" fill="#e58ca9" />
          <rect x="53" y="82" width="17" height="12" rx="3" fill="#f7dce7" />
          <circle cx="107" cy="75" r="7" fill="#f3c857" />
          <path d="M107 82 V98" stroke="#7b5bb6" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "heart-holder":
      return (
        <g filter={shadow}>
          <path d="M80 28 V54" stroke="#9b6270" strokeWidth="3" strokeLinecap="round" />
          <path d="M80 115 C48 92 37 72 48 58 C58 46 73 52 80 65 C87 52 102 46 112 58 C123 72 112 92 80 115Z" fill="#fff8f8" stroke="#c2455f" strokeWidth="5" />
          <ellipse cx="80" cy="100" rx="22" ry="10" fill="#f5d7dd" />
          <path d="M80 78 C89 89 89 99 80 101 C72 99 72 89 80 78Z" fill="#f0ad45" />
        </g>
      );
    case "red-hottie":
      return (
        <g filter={shadow}>
          <rect x="54" y="34" width="52" height="92" rx="20" fill="#c94a3f" />
          <rect x="66" y="27" width="28" height="18" rx="7" fill="#b43b32" />
          <path d="M80 94 C62 81 59 69 66 63 C73 57 79 62 80 69 C83 62 90 57 97 63 C103 70 98 82 80 94Z" fill="#fff4ed" />
          <path d="M62 53 H98 M60 115 H100" stroke="#ed9185" strokeWidth="4" strokeLinecap="round" />
          <path d="M63 66 H98 M62 80 H99 M62 106 H98" stroke="#d96659" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "coat-hanger":
      return (
        <g filter={shadow}>
          <path d="M80 44 C80 30 96 31 96 42 C96 51 84 51 82 61" fill="none" stroke="#8d622d" strokeWidth="5" strokeLinecap="round" />
          <path d="M44 104 L80 63 L116 104" fill="none" stroke="#8d622d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M62 105 C49 96 45 87 50 82 C55 77 61 80 62 86 C64 80 70 77 75 82 C80 87 75 96 62 105Z" fill="#f2c58f" />
          <path d="M98 105 C85 96 81 87 86 82 C91 77 97 80 98 86 C100 80 106 77 111 82 C116 87 111 96 98 105Z" fill="#f2c58f" />
        </g>
      );
    case "kitchen":
      return (
        <g filter={shadow}>
          <path d="M38 60 L80 34 L122 60 V124 H38Z" fill="#ecfff4" stroke="#2e8f67" strokeWidth="4" />
          <rect x="50" y="78" width="24" height="37" rx="4" fill="#ffffff" stroke="#6db28e" strokeWidth="3" />
          <rect x="80" y="78" width="31" height="37" rx="4" fill="#ffffff" stroke="#6db28e" strokeWidth="3" />
          <circle cx="91" cy="91" r="6" fill="#f0c658" />
          <circle cx="101" cy="91" r="6" fill="#f0c658" />
          <path d="M53 68 H107" stroke="#2e8f67" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 56 H72 V70 H58Z" fill="#cfeada" />
        </g>
      );
    case "nesting-boxes":
      return (
        <g filter={shadow}>
          <path d="M41 117 C42 83 53 59 70 59 C87 59 98 83 99 117Z" fill="#bd6a34" />
          <path d="M67 117 C68 75 82 47 102 47 C122 47 136 75 137 117Z" fill="#d98835" />
          <path d="M27 118 C28 91 37 72 51 72 C65 72 74 91 75 118Z" fill="#e0a44b" />
          <circle cx="102" cy="67" r="11" fill="#ffe0bf" />
          <circle cx="70" cy="76" r="9" fill="#ffe0bf" />
          <circle cx="51" cy="87" r="7" fill="#ffe0bf" />
          <path d="M85 94 C98 103 112 103 125 94" stroke="#fff2cf" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 98 C66 104 74 104 82 98" stroke="#fff2cf" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "union-hottie":
      return (
        <g filter={shadow}>
          <rect x="53" y="34" width="54" height="92" rx="19" fill="#f6f8fb" />
          <rect x="66" y="27" width="28" height="18" rx="7" fill="#e8edf5" />
          <UnionJack id={id} x={57} y={49} width={46} height={61} />
          <path d="M63 116 H97" stroke="#bac7d8" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "star-holder":
    default:
      return (
        <g filter={shadow}>
          <path d="M80 39 L91 64 L118 67 L98 85 L104 112 L80 98 L56 112 L62 85 L42 67 L69 64Z" fill="#f7fbff" stroke={accent} strokeWidth="5" strokeLinejoin="round" />
          <ellipse cx="80" cy="103" rx="27" ry="11" fill="#bfe4f0" />
          <path d="M80 77 C91 90 90 103 80 104 C70 102 70 90 80 77Z" fill="#f2b447" />
        </g>
      );
  }
}

export function ProductVisual({ stockCode, description, className }: ProductVisualProps) {
  const kind = productKind(stockCode, description);
  const theme = THEMES[kind];
  const id = `product-${stockCode.replace(/[^a-zA-Z0-9]/g, "") || "visual"}`;

  return (
    <svg
      className={cn("block size-full", className)}
      viewBox="0 0 160 160"
      role="img"
      aria-label={titleCase(description)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Background id={id} kind={kind} />
      <defs>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1f2a37" floodOpacity="0.2" />
        </filter>
      </defs>
      <Illustration id={id} kind={kind} accent={theme.accent} />
    </svg>
  );
}
