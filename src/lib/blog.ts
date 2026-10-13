import "server-only";
import fs from "fs";
import path from "path";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  minutes: number;
  tag: string;
  accent: "patient" | "pharmacy" | "clinic";
};

// Post metadata lives here; the body is the matching Markdown file in /content/blog.
const POSTS: Post[] = [
  {
    slug: "future-of-digital-pharmacy-services-in-india",
    title: "The Future of Digital Pharmacy Services in India",
    description:
      "Online medicine ordering, digital prescriptions and AI-assisted pharmacy operations are reshaping how India gets its medicines — while the pharmacist's judgement stays central.",
    date: "2026-08-26",
    minutes: 8,
    tag: "Pharmacy",
    accent: "pharmacy",
  },
  {
    slug: "how-technology-is-making-healthcare-more-convenient-for-patients",
    title: "How Technology Is Making Healthcare More Convenient for Patients",
    description:
      "From booking appointments online to ordering medicines from home, technology is changing how patients access and manage their care — without replacing the people who care for them.",
    date: "2026-08-26",
    minutes: 10,
    tag: "Patients",
    accent: "patient",
  },
];

export const getPosts = () => [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug) ?? null;

export function getPostHtml(slug: string) {
  const file = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  const md = fs.readFileSync(file, "utf8");
  return marked.parse(md, { async: false }) as string;
}

export function getLegalHtml(name: string, vars: Record<string, string>) {
  const file = path.join(process.cwd(), "content", "legal", `${name}.md`);
  let md = fs.readFileSync(file, "utf8");
  // {{key}} tokens come from site config; lines whose value is empty are dropped.
  md = md
    .split("\n")
    .filter((line) => !/\{\{(\w+)\}\}/.test(line) || [...line.matchAll(/\{\{(\w+)\}\}/g)].every((m) => vars[m[1]]))
    .map((line) => line.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k]))
    .join("\n");
  return marked.parse(md, { async: false, breaks: true }) as string;
}
