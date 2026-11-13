import "server-only";
import fs from "fs";
import path from "path";
import { marked } from "marked";
import posts from "@/content/blog-posts.json";
import { TOPICS, type Topic } from "@/lib/blog-topics";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  minutes: number;
  topic: Topic;
  format: "story" | "swipe";
  tldr?: string;
  cards?: number; // swipe decks only
  featured?: boolean;
};

export type Swipe = {
  cards: { title: string; body: string }[];
  takeaway: string;
  share: string;
};

export const accentOf = (p: Pick<Post, "topic">) => TOPICS[p.topic].accent;

// Post metadata lives in blog-posts.json; a story's body is /content/blog/<slug>.md,
// a swipe deck's cards are /content/swipes/<slug>.json.
const POSTS = posts as Post[];

export const getPosts = () =>
  [...POSTS].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.date.localeCompare(a.date));
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug) ?? null;

export function getPostHtml(slug: string) {
  const file = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  const md = fs.readFileSync(file, "utf8");
  return marked.parse(md, { async: false }) as string;
}

export function getSwipe(slug: string): Swipe {
  const file = path.join(process.cwd(), "content", "swipes", `${slug}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Swipe;
}

/** Same topic first, never the post itself. */
export function getRelated(post: Post, format: Post["format"], count = 3) {
  return getPosts()
    .filter((p) => p.slug !== post.slug && p.format === format)
    .sort((a, b) => Number(b.topic === post.topic) - Number(a.topic === post.topic))
    .slice(0, count);
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
