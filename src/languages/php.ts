import path from "path";
import * as utils from "../utils";

export type PhpFramework = "laravel" | null;
export type PhpPackageManager = "composer" | "none";

export interface ComposerJson {
  name?: string;
  description?: string;
  license?: string;
  require?: Record<string, string>;
  "require-dev"?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface ComposerScriptInfo {
  name: string;
  command: string;
  description: string;
}

export interface PhpProjectInfo {
  language: "PHP";
  projectName: string;
  description: string;
  framework: PhpFramework;
  packageManager: PhpPackageManager;
  installCommand: string;
  runCommand: string;
  testCommand: string;
  buildCommand: string | null;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  composerScripts: ComposerScriptInfo[];
  license?: string;
  hasIndexPhp: boolean;
  hasPhpUnitConfig: boolean;
  frontend?: { hasPackageJson: boolean; hasDevScript: boolean };
}

const PHP_DETECT_FILES = [
  "composer.json",
  "composer.lock",
  "index.php",
  "artisan",
  "phpunit.xml",
  "phpunit.xml.dist",
] as const;

export async function detectPhpProject(rootDir: string): Promise<boolean> {
  for (const f of PHP_DETECT_FILES) {
    if (await utils.fileExists(path.join(rootDir, f))) {
      return true;
    }
  }
  return false;
}

export async function readComposerJson(rootDir: string): Promise<ComposerJson | null> {
  const composerPath = path.join(rootDir, "composer.json");
  if (!(await utils.fileExists(composerPath))) return null;
  try {
    return await utils.readJsonFile<ComposerJson>(composerPath);
  } catch {
    return null;
  }
}

export async function detectPhpFramework(
  rootDir: string,
  composer: ComposerJson | null,
): Promise<PhpFramework> {
  // Strong Laravel signals
  if (await utils.fileExists(path.join(rootDir, "artisan"))) return "laravel";
  if (await utils.fileExists(path.join(rootDir, "bootstrap", "app.php"))) return "laravel";
  if (await utils.fileExists(path.join(rootDir, "routes", "web.php"))) return "laravel";
  if (await utils.fileExists(path.join(rootDir, "routes", "api.php"))) return "laravel";
  if (await utils.fileExists(path.join(rootDir, "app", "Http"))) return "laravel";

  // composer.json contents
  const req = composer?.require ?? {};
  if (req["laravel/framework"]) return "laravel";
  if (req["laravel/laravel"]) return "laravel";

  return null;
}

export async function detectComposer(rootDir: string): Promise<PhpPackageManager> {
  if (
    (await utils.fileExists(path.join(rootDir, "composer.json"))) ||
    (await utils.fileExists(path.join(rootDir, "composer.lock")))
  ) {
    return "composer";
  }
  return "none";
}

export function describeComposerScript(name: string): string {
  const n = name.toLowerCase();
  if (n === "test") return "Run tests";
  if (n === "format") return "Format code";
  if (n === "lint") return "Run lint checks";
  if (n === "analyse" || n === "analyze") return "Run static analysis";
  if (n === "stan") return "Run PHPStan analysis";
  if (n === "pint") return "Run Laravel Pint formatter";
  if (n === "fix") return "Fix code style issues";
  if (n === "serve" || n === "start") return n === "serve" ? "Start local development server" : "Start the app";
  return `Run the ${name} script`;
}

export function getComposerScripts(composer: ComposerJson | null): ComposerScriptInfo[] {
  const entries = Object.entries(composer?.scripts ?? {});
  return entries.map(([name, command]) => ({
    name,
    command,
    description: describeComposerScript(name),
  }));
}

export async function getPhpCommands(
  framework: PhpFramework,
  hasIndexPhp: boolean,
  hasPhpUnitConfig: boolean,
): Promise<{ installCommand: string; runCommand: string; testCommand: string; buildCommand: string | null }> {
  // Installation is always composer for detected PHP projects
  const installCommand = "composer install";

  if (framework === "laravel") {
    return {
      installCommand,
      runCommand: "php artisan serve",
      testCommand: "php artisan test",
      buildCommand: null,
    };
  }

  // Basic PHP project
  const runCommand = hasIndexPhp ? "php index.php" : "php your-script.php";
  const testCommand = hasPhpUnitConfig ? "vendor/bin/phpunit" : "# Add your test command here";
  return { installCommand, runCommand, testCommand, buildCommand: null };
}

export async function getPhpProjectInfo(rootDir: string): Promise<PhpProjectInfo> {
  const composer = await readComposerJson(rootDir);
  const framework = await detectPhpFramework(rootDir, composer);
  const pkgMgr = await detectComposer(rootDir);

  const hasIndexPhp = await utils.fileExists(path.join(rootDir, "index.php"));
  const hasPhpUnitConfig =
    (await utils.fileExists(path.join(rootDir, "phpunit.xml"))) ||
    (await utils.fileExists(path.join(rootDir, "phpunit.xml.dist")));

  // Optional frontend detection (for Laravel + package.json)
  const packageJsonPath = path.join(rootDir, "package.json");
  let frontend: { hasPackageJson: boolean; hasDevScript: boolean } | undefined;
  if (await utils.fileExists(packageJsonPath)) {
    try {
      const pkg = JSON.parse(await utils.readFile(packageJsonPath, "utf8"));
      const hasDev = Boolean(pkg?.scripts && typeof pkg.scripts.dev === "string");
      frontend = { hasPackageJson: true, hasDevScript: hasDev };
    } catch {
      frontend = { hasPackageJson: true, hasDevScript: false };
    }
  }

  const commands = await getPhpCommands(framework, hasIndexPhp, hasPhpUnitConfig);

  const projectName = composer?.name ?? path.basename(rootDir);
  const description = composer?.description ?? (framework === "laravel" ? "A Laravel PHP project." : "A PHP project.");

  const dependencies = composer?.require ?? {};
  const devDependencies = composer?.["require-dev"] ?? {};
  const license = composer?.license;

  return {
    language: "PHP",
    projectName,
    description,
    framework,
    packageManager: pkgMgr,
    installCommand: commands.installCommand,
    runCommand: commands.runCommand,
    testCommand: commands.testCommand,
    buildCommand: commands.buildCommand,
    dependencies,
    devDependencies,
    composerScripts: getComposerScripts(composer),
    license,
    hasIndexPhp,
    hasPhpUnitConfig,
    frontend,
  };
}
