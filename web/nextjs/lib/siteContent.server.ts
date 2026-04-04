import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultSiteContent, mergeWithDefaultSiteContent, type SiteContent } from "./siteContent";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const MEDIA_DIR = process.env.MEDIA_STORAGE_ROOT?.trim()
  ? path.resolve(process.env.MEDIA_STORAGE_ROOT)
  : process.platform === "win32"
    ? path.join(DATA_DIR, "media")
    : "/storage/media";

export type StoredMediaFile = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  modifiedAt: string;
};

const sanitizeFileName = (input: string): string => {
  const baseName = path.basename(input);
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return safeName || `media-${Date.now()}`;
};

const guessMimeType = (fileName: string): string => {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

const buildMediaUrl = (fileName: string): string => `/api/media/file/${encodeURIComponent(fileName)}`;

export const getMediaStorageRoot = (): string => MEDIA_DIR;

export const ensureMediaDir = async (): Promise<void> => {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
};

export const saveUploadedMedia = async (fileName: string, buffer: Buffer): Promise<StoredMediaFile> => {
  await ensureMediaDir();

  const safeName = sanitizeFileName(fileName);
  const extension = path.extname(safeName);
  const base = extension ? safeName.slice(0, -extension.length) : safeName;

  let candidate = safeName;
  let counter = 1;
  while (true) {
    try {
      await fs.access(path.join(MEDIA_DIR, candidate));
      candidate = `${base}-${counter}${extension}`;
      counter += 1;
    } catch {
      break;
    }
  }

  const absolutePath = path.join(MEDIA_DIR, candidate);
  await fs.writeFile(absolutePath, buffer);
  const stats = await fs.stat(absolutePath);

  return {
    name: candidate,
    url: buildMediaUrl(candidate),
    mimeType: guessMimeType(candidate),
    size: stats.size,
    modifiedAt: stats.mtime.toISOString(),
  };
};

export const listStoredMedia = async (): Promise<StoredMediaFile[]> => {
  try {
    await ensureMediaDir();
    const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const absolutePath = path.join(MEDIA_DIR, entry.name);
          const stats = await fs.stat(absolutePath);
          return {
            name: entry.name,
            url: buildMediaUrl(entry.name),
            mimeType: guessMimeType(entry.name),
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
          };
        })
    );

    return files.sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt));
  } catch {
    return [];
  }
};

export const readStoredMedia = async (fileName: string): Promise<{ buffer: Buffer; mimeType: string } | null> => {
  const safeName = sanitizeFileName(fileName);
  const absolutePath = path.join(MEDIA_DIR, safeName);

  try {
    const buffer = await fs.readFile(absolutePath);
    return { buffer, mimeType: guessMimeType(safeName) };
  } catch {
    return null;
  }
};

export const deleteStoredMedia = async (fileName: string): Promise<boolean> => {
  const safeName = sanitizeFileName(fileName);
  const absolutePath = path.join(MEDIA_DIR, safeName);

  try {
    await fs.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
};

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
