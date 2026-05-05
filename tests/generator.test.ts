import { describe, expect, it } from "vitest";
import { generateReadme } from "../src/generator";
import type { PackageManagerName } from "../src/package-manager";
import type { ScanResult } from "../src/scanner";

function makeScan(packageManager: PackageManagerName): ScanResult {
  return {
    rootDir: "project",
    language: "javascript",
    packageJson: {},
    packageName: "sample-app",
    description: "Sample app",
    version: "1.0.0",
    dependencies: [],
    devDependencies: [],
    scripts: [
      { name: "dev", command: "vite", description: "Start development server" },
      { name: "build", command: "vite build", description: "Build the project" },
      { name: "test", command: "vitest", description: "Run tests" },
      { name: "start", command: "node dist/index.js", description: "Start the app" },
      { name: "check", command: "tsc --noEmit", description: "Run project checks" },
    ],
    hasBin: false,
    binCommands: [],
    exportsInfo: {},
    repository: "",
    license: "MIT",
    author: "JomsCode21",
    filePresence: {},
    projectTypes: ["Node.js package"],
    envVariables: [],
    sourceFiles: [],
    testFiles: [],
    packageManager,
  } as unknown as ScanResult;
}

describe("generateReadme package manager commands", () => {
  it("uses npm commands in Available Scripts, Installation, and Development", () => {
    const output = generateReadme(makeScan("npm"), {
      includeChecklist: false,
      includeTree: false,
    });
    expect(output).toContain("npm install");
    expect(output).toContain("npm run dev");
    expect(output).toContain("npm run build");
    expect(output).toContain("npm test");
    expect(output).toContain("| `dev` | Start development server | `npm run dev` |");
  });

  it("can generate a basic PHP README sections (smoke)", () => {
    const scan: any = {
      rootDir: "proj",
      language: "php",
      packageName: "example/php-basic",
      description: "A PHP project.",
      version: "0.1.0",
      dependencies: [],
      devDependencies: [],
      scripts: [],
      hasBin: false,
      binCommands: [],
      exportsInfo: {},
      filePresence: {},
      projectTypes: ["PHP project"],
      envVariables: [],
      sourceFiles: [],
      testFiles: [],
      phpInfo: {
        language: "PHP",
        projectName: "example/php-basic",
        description: "A PHP project.",
        framework: null,
        packageManager: "composer",
        installCommand: "composer install",
        runCommand: "php index.php",
        testCommand: "vendor/bin/phpunit",
        buildCommand: null,
        dependencies: {},
        devDependencies: {},
        composerScripts: [],
        hasIndexPhp: true,
        hasPhpUnitConfig: true,
      },
    } as ScanResult;
    const output = generateReadme(scan, { includeChecklist: false, includeTree: false });
    expect(output).toContain("## Installation");
    expect(output).toContain("composer install");
    expect(output).toContain("## Usage");
  });

  it("can generate a Laravel README sections (smoke)", () => {
    const scan: any = {
      rootDir: "proj",
      language: "php",
      packageName: "example/php-laravel",
      description: "A Laravel PHP project.",
      version: "0.1.0",
      dependencies: [],
      devDependencies: [],
      scripts: [],
      hasBin: false,
      binCommands: [],
      exportsInfo: {},
      filePresence: {},
      projectTypes: ["PHP project", "Laravel project"],
      envVariables: ["APP_NAME", "APP_ENV"],
      sourceFiles: [],
      testFiles: [],
      phpInfo: {
        language: "PHP",
        projectName: "example/php-laravel",
        description: "A Laravel PHP project.",
        framework: "laravel",
        packageManager: "composer",
        installCommand: "composer install",
        runCommand: "php artisan serve",
        testCommand: "php artisan test",
        buildCommand: null,
        dependencies: { "laravel/framework": "^11.0" },
        devDependencies: {},
        composerScripts: [{ name: "test", command: "php artisan test", description: "Run tests" }],
        hasIndexPhp: false,
        hasPhpUnitConfig: false,
        frontend: { hasPackageJson: true, hasDevScript: true },
      },
    } as ScanResult;
    const output = generateReadme(scan, { includeChecklist: false, includeTree: false });
    expect(output).toContain("php artisan serve");
    expect(output).toContain("php artisan migrate");
    expect(output).toContain("Available Composer Scripts");
  });

  it("uses pnpm commands in Available Scripts, Installation, and Development", () => {
    const output = generateReadme(makeScan("pnpm"), {
      includeChecklist: false,
      includeTree: false,
    });

    expect(output).toContain("pnpm install");
    expect(output).toContain("pnpm dev");
    expect(output).toContain("pnpm build");
    expect(output).toContain("pnpm test");
    expect(output).toContain("| `dev` | Start development server | `pnpm dev` |");
  });

  it("uses yarn commands in Available Scripts, Installation, and Development", () => {
    const output = generateReadme(makeScan("yarn"), {
      includeChecklist: false,
      includeTree: false,
    });

    expect(output).toContain("yarn install");
    expect(output).toContain("yarn dev");
    expect(output).toContain("yarn build");
    expect(output).toContain("yarn test");
    expect(output).toContain("| `dev` | Start development server | `yarn dev` |");
  });

  it("uses bun commands in Available Scripts, Installation, and Development", () => {
    const output = generateReadme(makeScan("bun"), {
      includeChecklist: false,
      includeTree: false,
    });

    expect(output).toContain("bun install");
    expect(output).toContain("bun run dev");
    expect(output).toContain("bun run build");
    expect(output).toContain("bun test");
    expect(output).toContain("| `dev` | Start development server | `bun run dev` |");
  });
});
