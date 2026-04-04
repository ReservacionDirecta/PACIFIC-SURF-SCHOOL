import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultSiteContent, mergeWithDefaultSiteContent, type SiteContent } from "./siteContent";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");

export const readSiteContent = async (): Promise<SiteContent> => {
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return mergeWithDefaultSiteContent(parsed);
  } catch {
    return defaultSiteContent;
  }
};

export const writeSiteContent = async (content: SiteContent): Promise<SiteContent> => {
  const normalized = mergeWithDefaultSiteContent(content);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONTENT_FILE, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
};
