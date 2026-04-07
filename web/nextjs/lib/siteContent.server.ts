import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { defaultSiteContent, mergeWithDefaultSiteContent, type SiteContent } from "./siteContent";

const DATA_DIR = path.join(process.cwd(), "data");
const DEFAULT_MEDIA_DIR = process.env.MEDIA_STORAGE_ROOT?.trim()
  ? path.resolve(process.env.MEDIA_STORAGE_ROOT)
  : process.platform === "win32"
    ? path.join(DATA_DIR, "media")
    : "/storage/media";
const LEGACY_CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const LEGACY_CONTENT_DIR_LINUX = "/storage/cms";
const DEFAULT_CONTENT_DIR = process.env.CONTENT_STORAGE_ROOT?.trim()
  ? path.resolve(process.env.CONTENT_STORAGE_ROOT)
  : process.platform === "win32"
    ? path.join(DATA_DIR, "cms")
    : path.join(DEFAULT_MEDIA_DIR, "cms");

let MEDIA_DIR = DEFAULT_MEDIA_DIR;
let CONTENT_DIR = DEFAULT_CONTENT_DIR;

const getContentFile = (): string => path.join(CONTENT_DIR, "site-content.json");
const LOCAL_FALLBACK_CONTENT_DIR = path.join(DATA_DIR, "cms");
const TEMP_FALLBACK_CONTENT_DIR = path.join(os.tmpdir(), "pacific-surf-cms");

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

const buildMediaUrl = (fileName: string): string => `/media/${encodeURIComponent(fileName)}`;

export const getMediaStorageRoot = (): string => MEDIA_DIR;

export const ensureMediaDir = async (): Promise<void> => {
  try {
    await fs.mkdir(MEDIA_DIR, { recursive: true });
  } catch {
    const fallbackMediaDir = path.join(DATA_DIR, "media");
    await fs.mkdir(fallbackMediaDir, { recursive: true });
    MEDIA_DIR = fallbackMediaDir;

    if (!process.env.CONTENT_STORAGE_ROOT?.trim()) {
      CONTENT_DIR = path.join(fallbackMediaDir, "cms");
    }
  }
};

const ensureContentDir = async (): Promise<void> => {
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
  } catch {
    await fs.mkdir(LOCAL_FALLBACK_CONTENT_DIR, { recursive: true });
    CONTENT_DIR = LOCAL_FALLBACK_CONTENT_DIR;
  }
};

const isPermissionLikeError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const maybeCode = (error as Error & { code?: string }).code;
  return maybeCode === "EACCES" || maybeCode === "EPERM" || maybeCode === "EROFS";
};

const writeContentWithFallback = async (content: SiteContent): Promise<void> => {
  const serialized = JSON.stringify(content, null, 2);
  const candidateDirs = [CONTENT_DIR, LOCAL_FALLBACK_CONTENT_DIR, TEMP_FALLBACK_CONTENT_DIR].filter(
    (value, index, all) => all.indexOf(value) === index
  );

  let lastError: unknown = null;

  for (const dir of candidateDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "site-content.json"), serialized, "utf8");
      CONTENT_DIR = dir;
      return;
    } catch (error) {
      lastError = error;
      if (!isPermissionLikeError(error) && dir === TEMP_FALLBACK_CONTENT_DIR) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to write site content in any storage path");
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

const readContentFile = async (filePath: string): Promise<SiteContent | null> => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return mergeWithDefaultSiteContent(parsed);
  } catch {
    return null;
  }
};

export const readSiteContent = async (): Promise<SiteContent> => {
  const persisted = await readContentFile(getContentFile());
  if (persisted) return persisted;

  // Backward compatibility for previous default Linux path.
  if (process.platform !== "win32") {
    const oldLinuxPath = path.join(LEGACY_CONTENT_DIR_LINUX, "site-content.json");
    const oldLinuxContent = await readContentFile(oldLinuxPath);
    if (oldLinuxContent) {
      try {
        await writeContentWithFallback(oldLinuxContent);
      } catch {
        // Ignore migration copy failures and continue serving migrated content.
      }

      return oldLinuxContent;
    }
  }

  // Backward compatibility: if the old local file exists, reuse it and persist to the new location.
  const legacy = await readContentFile(LEGACY_CONTENT_FILE);
  if (legacy) {
    try {
      await writeContentWithFallback(legacy);
    } catch {
      // Ignore migration copy failures and continue serving legacy content.
    }

    return legacy;
  }

  return defaultSiteContent;
};

export const writeSiteContent = async (content: SiteContent): Promise<SiteContent> => {
  const normalized = mergeWithDefaultSiteContent(content);
  await writeContentWithFallback(normalized);
  return normalized;
};
