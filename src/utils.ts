import { constants } from "fs";
import { access, readFile as fsReadFile } from "fs/promises";
import path from "path";

export { fsReadFile as readFile };

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fsReadFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function toArray(
  value?: string | string[] | Record<string, string>,
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return [value];
  }

  return Object.keys(value);
}

export function normalizeAuthor(author?: string | { name?: string }): string {
  if (!author) {
    return "";
  }

  return typeof author === "string" ? author : (author.name ?? "");
}
