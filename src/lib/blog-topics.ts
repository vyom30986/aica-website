// Shared by the server blog loader and the client explorer.
export const TOPICS = {
  caregiving: { label: "Caregiving", accent: "patient" },
  "meds-101": { label: "Meds 101", accent: "patient" },
  "chemist-life": { label: "Chemist life", accent: "pharmacy" },
  "doctor-visits": { label: "Doctor visits", accent: "clinic" },
  "family-tech": { label: "Family & tech", accent: "clinic" },
  "building-aica": { label: "Building AICA", accent: "pharmacy" },
} as const;

export type Topic = keyof typeof TOPICS;
export type Accent = (typeof TOPICS)[Topic]["accent"];
export const TOPIC_KEYS = Object.keys(TOPICS) as Topic[];
