import { readFile } from "fs/promises";

export async function parseEnvExample(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf8");
  const variables = new Set<string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalIndex = line.indexOf("=");
    const key = equalIndex >= 0 ? line.slice(0, equalIndex).trim() : line;

    if (key) {
      variables.add(key);
    }
  }

  return [...variables];
}
