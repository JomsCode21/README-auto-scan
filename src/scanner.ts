import fg from "fast-glob";
import path from "path";
import { detectProjectTypes } from "./detector";
import { parseEnvExample } from "./env";
import {
  detectPythonProject,
  getPythonProjectInfo,
  type PythonProjectInfo,
} from "./languages/python";
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

export type ProjectLanguage = "javascript" | "typescript" | "python";

export interface ScanResult {
  rootDir: string;
  language: ProjectLanguage;
  // JavaScript/TypeScript specific (optional for Python)
  packageJson?: PackageJson;
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
  packageManager?: PackageManagerName;
  // Python specific (optional for JS/TS)
  pythonInfo?: PythonProjectInfo;
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
  const hasPackageJson = await fileExists(packageJsonPath);

  // Check for Python project (only if no package.json exists)
  const isPythonProject = hasPackageJson ? false : await detectPythonProject(rootDir);

  // If neither package.json nor Python files found
  if (!hasPackageJson && !isPythonProject) {
    throw new Error(
      "No supported project files found. Please run this command inside a JavaScript, TypeScript, or Python project.",
    );
  }

  // Handle Python project
  if (isPythonProject) {
    const pythonInfo = await getPythonProjectInfo(rootDir);

    // File presence for Python projects
    const pythonImportantFiles = [
      "requirements.txt",
      "pyproject.toml",
      "setup.py",
      "Pipfile",
      "poetry.lock",
      "main.py",
      "app.py",
      "manage.py",
      "README.md",
      "LICENSE",
      ".env.example",
    ];

    const filePresenceEntries = await Promise.all(
      pythonImportantFiles.map(
        async (file) =>
          [file, await fileExists(path.join(rootDir, file))] as const,
      ),
    );
    const filePresence = Object.fromEntries(filePresenceEntries);

    // Find Python source files
    const sourceFiles = (
      await fg(["**/*.py"], {
        cwd: rootDir,
        ignore: [
          "**/__pycache__/**",
          "**/.venv/**",
          "**/venv/**",
          "**/env/**",
          "**/.pytest_cache/**",
          "**/.mypy_cache/**",
          "**/.ruff_cache/**",
          "**/dist/**",
          "**/build/**",
          "**/.git/**",
          "**/.idea/**",
          "**/.vscode/**",
        ],
        onlyFiles: true,
      })
    ).map(toPosixPath);

    // Find Python test files
    const testFiles = (
      await fg(["**/test_*.py", "**/tests/**/*.py", "**/*_test.py"], {
        cwd: rootDir,
        ignore: ["**/__pycache__/**", "**/.venv/**", "**/venv/**", "**/env/**"],
        onlyFiles: true,
      })
    ).map(toPosixPath);

    const envVariables = filePresence[".env.example"]
      ? await parseEnvExample(path.join(rootDir, ".env.example"))
      : [];

    // Determine project types
    const projectTypes: string[] = ["Python project"];
    if (pythonInfo.framework) {
      projectTypes.push(
        `${pythonInfo.framework.charAt(0).toUpperCase() + pythonInfo.framework.slice(1)} project`,
      );
    }

    return {
      rootDir,
      language: "python",
      packageName: pythonInfo.projectName,
      description: pythonInfo.description,
      version: "0.1.0",
      dependencies: pythonInfo.dependencies,
      devDependencies: [],
      scripts: [],
      hasBin: false,
      binCommands: [],
      exportsInfo: {},
      filePresence,
      projectTypes,
      envVariables,
      sourceFiles,
      testFiles,
      pythonInfo,
    };
  }

  // Handle JavaScript/TypeScript project
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

  // Determine if TypeScript
  const hasTypeScript =
    projectTypes.includes("TypeScript package") ||
    devDependencies.includes("typescript");

  return {
    rootDir,
    language: hasTypeScript ? "typescript" : "javascript",
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
