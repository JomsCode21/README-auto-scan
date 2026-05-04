import { describe, expect, it } from "vitest";
import { generateReadme } from "../src/generator";
import type { PackageManagerName } from "../src/package-manager";
import type { ScanResult } from "../src/scanner";

function makeScan(packageManager: PackageManagerName): ScanResult {
  return {
    rootDir: "project",
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
  };
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
