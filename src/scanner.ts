import fg from "fast-glob";
import path from "path";
import { detectProjectTypes } from "./detector";
import { parseEnvExample } from "./env";
import { detectPackageManager, type PackageManagerName } from "./package-manager";
import { explainScripts } from "./scripts";
import {
  fileExists,
  normalizeAuthor,
  readJsonFile,
  toArray,
  toPosixPath,
} from "./utils";

export interface PackageJson {
  name?: string;
  description?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  bin?: string | Record<string, string>;
  main?: string;
  module?: string;
  types?: string;
  repository?: string | { url?: string };
  license?: string;
  author?: string | { name?: string };
}

export interface ScanResult {
  rootDir: string;
  packageJson: PackageJson;
  packageName: string;
  description: string;
  version: string;
  dependencies: string[];
  devDependencies: string[];
  scripts: Array<{ name: string; command: string; description: string }>;
  hasBin: boolean;
  binCommands: string[];
  exportsInfo: { main?: string; module?: string; types?: string };
  repository?: string;
  license?: string;
  author?: string;
  filePresence: Record<string, boolean>;
  projectTypes: string[];
  envVariables: string[];
  sourceFiles: string[];
  testFiles: string[];
  packageManager: PackageManagerName;
}

const IMPORTANT_FILES = [
  "src/index.js",
  "src/index.ts",
  "index.js",
  "index.ts",
  "README.md",
  "LICENSE",
  ".env.example",
  "tsconfig.json",
  "vite.config.js",
  "vite.config.ts",
  "next.config.js",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.ts",
] as const;

export async function scanProject(rootDir: string): Promise<ScanResult> {
  const packageJsonPath = path.join(rootDir, "package.json");

  if (!(await fileExists(packageJsonPath))) {
    throw new Error(`No package.json found in ${rootDir}`);
  }

  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);
  const scripts = packageJson.scripts ?? {};
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  const devDependencies = Object.keys(packageJson.devDependencies ?? {});
  const hasBin = Boolean(packageJson.bin);

  const filePresenceEntries = await Promise.all(
    IMPORTANT_FILES.map(
      async (file) =>
        [file, await fileExists(path.join(rootDir, file))] as const,
    ),
  );
  const filePresence = Object.fromEntries(filePresenceEntries);

  const sourceFiles = (
    await fg(["src/**/*.{js,jsx,ts,tsx}", "*.{js,ts}"], {
      cwd: rootDir,
      ignore: ["node_modules/**", "dist/**", "build/**"],
      onlyFiles: true,
    })
  ).map(toPosixPath);

  const testFiles = (
    await fg(
      ["**/*.{test,spec}.{js,jsx,ts,tsx}", "test/**/*.{js,jsx,ts,tsx}"],
      {
        cwd: rootDir,
        ignore: ["node_modules/**", "dist/**", "build/**"],
        onlyFiles: true,
      },
    )
  ).map(toPosixPath);

  const envVariables = filePresence[".env.example"]
    ? await parseEnvExample(path.join(rootDir, ".env.example"))
    : [];

  const projectTypes = detectProjectTypes({
    dependencies,
    devDependencies,
    filePresence,
    hasBin,
  });

  const packageManager = await detectPackageManager(rootDir);

  return {
    rootDir,
    packageJson,
    packageName: packageJson.name ?? path.basename(rootDir),
    description: packageJson.description ?? "Project description goes here.",
    version: packageJson.version ?? "0.1.0",
    dependencies,
    devDependencies,
    scripts: explainScripts(scripts),
    hasBin,
    binCommands: toArray(packageJson.bin),
    exportsInfo: {
      main: packageJson.main,
      module: packageJson.module,
      types: packageJson.types,
    },
    repository:
      typeof packageJson.repository === "string"
        ? packageJson.repository
        : packageJson.repository?.url,
    license: packageJson.license,
    author: normalizeAuthor(packageJson.author),
    filePresence,
    projectTypes,
    envVariables,
    sourceFiles,
    testFiles,
    packageManager: packageManager.name,
  };
}
