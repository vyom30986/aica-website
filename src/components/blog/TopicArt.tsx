import { TOPICS, type Topic } from "@/lib/blog-topics";

// One small, flat illustration per topic, drawn in the topic's accent colour.
export function TopicArt({ topic, className = "" }: { topic: Topic; className?: string }) {
  const c = `var(--color-${TOPICS[topic].accent})`;
  const soft = `color-mix(in srgb, ${c} 18%, white)`;
  const shapes: Record<Topic, React.ReactNode> = {
    caregiving: (
      <>
        <circle cx="38" cy="44" r="20" fill={soft} />
        <circle cx="62" cy="44" r="20" fill={c} opacity=".85" />
        <path d="M50 76c-10-7-18-13-18-21a8 8 0 0 1 18-4 8 8 0 0 1 18 4c0 8-8 14-18 21Z" fill="white" />
      </>
    ),
    "meds-101": (
      <>
        <rect x="18" y="38" width="64" height="26" rx="13" transform="rotate(-30 50 51)" fill={soft} />
        <path d="M33 64 50 51 L 61 70 A13 13 0 0 1 39 83 Z" transform="rotate(-30 50 51) translate(-12 -6)" fill={c} />
        <circle cx="74" cy="26" r="6" fill={c} opacity=".5" />
      </>
    ),
    "chemist-life": (
      <>
        <rect x="16" y="16" width="68" height="68" rx="20" fill={soft} />
        <path d="M42 30h16v12h12v16H58v12H42V58H30V42h12Z" fill={c} />
      </>
    ),
    "doctor-visits": (
      <>
        <circle cx="50" cy="50" r="34" fill={soft} />
        <path d="M34 28v18a16 16 0 0 0 32 0V28" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
        <circle cx="66" cy="70" r="7" fill={c} />
        <path d="M50 62v4a12 12 0 0 0 12 12" fill="none" stroke={c} strokeWidth="5" />
      </>
    ),
    "family-tech": (
      <>
        <rect x="30" y="14" width="40" height="72" rx="10" fill={soft} />
        <rect x="36" y="24" width="28" height="44" rx="4" fill={c} opacity=".85" />
        <circle cx="50" cy="77" r="3.5" fill={c} />
        <path d="M42 40h16M42 48h10" stroke="white" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
    "building-aica": (
      <>
        <circle cx="50" cy="22" r="10" fill={c} />
        <circle cx="24" cy="72" r="10" fill={soft} stroke={c} strokeWidth="3" />
        <circle cx="76" cy="72" r="10" fill={soft} stroke={c} strokeWidth="3" />
        <path d="M50 32v20M50 52 30 66M50 52l20 14" stroke={c} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      {shapes[topic]}
    </svg>
  );
}
