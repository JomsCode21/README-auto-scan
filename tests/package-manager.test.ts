import { describe, expect, it, vi } from "vitest";
import { detectPackageManager, getPackageManager } from "../src/package-manager";
import * as utils from "../src/utils";

function hasLockPath(filePath: string, lockFileName: string): boolean {
  return (
    filePath.endsWith(`/${lockFileName}`) ||
    filePath.endsWith(`\\${lockFileName}`)
  );
}

describe("detectPackageManager", () => {
  it("detects npm from package-lock.json", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasLockPath(filePath, "package-lock.json");
    });

    const result = await detectPackageManager("root");
    expect(result.name).toBe("npm");
    expect(result.install).toBe("npm install");
  });

  it("detects pnpm from pnpm-lock.yaml", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasLockPath(filePath, "pnpm-lock.yaml");
    });

    const result = await detectPackageManager("root");
    expect(result.name).toBe("pnpm");
    expect(result.install).toBe("pnpm install");
  });

  it("detects yarn from yarn.lock", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasLockPath(filePath, "yarn.lock");
    });

    const result = await detectPackageManager("root");
    expect(result.name).toBe("yarn");
    expect(result.install).toBe("yarn install");
  });

  it("detects bun from bun.lockb", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasLockPath(filePath, "bun.lockb");
    });

    const result = await detectPackageManager("root");
    expect(result.name).toBe("bun");
    expect(result.install).toBe("bun install");
  });

  it("detects bun from bun.lock", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasLockPath(filePath, "bun.lock");
    });

    const result = await detectPackageManager("root");
    expect(result.name).toBe("bun");
    expect(result.install).toBe("bun install");
  });

  it("defaults to npm when no lock file found", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPackageManager("root");
    expect(result.name).toBe("npm");
  });

  it("prioritizes npm when npm and pnpm lock files both exist", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return (
        hasLockPath(filePath, "pnpm-lock.yaml") ||
        hasLockPath(filePath, "package-lock.json")
      );
    });

    const result = await detectPackageManager("root");
    // package-lock.json is checked first in detection order
    expect(result.name).toBe("npm");
  });
});

describe("getPackageManager", () => {
  it("returns npm package manager", () => {
    const pm = getPackageManager("npm");
    expect(pm.name).toBe("npm");
    expect(pm.install).toBe("npm install");
    expect(pm.run("dev")).toBe("npm run dev");
    expect(pm.run("test")).toBe("npm test");
    expect(pm.run("start")).toBe("npm start");
    expect(pm.exec("eslint")).toBe("npx eslint");
  });

  it("returns pnpm package manager", () => {
    const pm = getPackageManager("pnpm");
    expect(pm.name).toBe("pnpm");
    expect(pm.install).toBe("pnpm install");
    expect(pm.run("dev")).toBe("pnpm dev");
    expect(pm.run("test")).toBe("pnpm test");
    expect(pm.exec("eslint")).toBe("pnpm exec eslint");
  });

  it("returns yarn package manager", () => {
    const pm = getPackageManager("yarn");
    expect(pm.name).toBe("yarn");
    expect(pm.install).toBe("yarn install");
    expect(pm.run("dev")).toBe("yarn dev");
    expect(pm.run("build")).toBe("yarn build");
  });

  it("returns bun package manager", () => {
    const pm = getPackageManager("bun");
    expect(pm.name).toBe("bun");
    expect(pm.install).toBe("bun install");
    expect(pm.run("dev")).toBe("bun run dev");
    expect(pm.run("test")).toBe("bun test");
    expect(pm.run("start")).toBe("bun start");
    expect(pm.exec("eslint")).toBe("bunx eslint");
  });
});

describe("package manager run commands", () => {
  it("npm uses shortcuts for test and start", () => {
    const pm = getPackageManager("npm");
    expect(pm.run("test")).toBe("npm test");
    expect(pm.run("start")).toBe("npm start");
    expect(pm.run("dev")).toBe("npm run dev");
    expect(pm.run("build")).toBe("npm run build");
  });

  it("pnpm uses direct script names", () => {
    const pm = getPackageManager("pnpm");
    expect(pm.run("test")).toBe("pnpm test");
    expect(pm.run("start")).toBe("pnpm start");
    expect(pm.run("dev")).toBe("pnpm dev");
    expect(pm.run("build")).toBe("pnpm build");
  });

  it("yarn uses direct script names", () => {
    const pm = getPackageManager("yarn");
    expect(pm.run("test")).toBe("yarn test");
    expect(pm.run("start")).toBe("yarn start");
    expect(pm.run("dev")).toBe("yarn dev");
    expect(pm.run("build")).toBe("yarn build");
  });

  it("bun uses shortcuts for test and start", () => {
    const pm = getPackageManager("bun");
    expect(pm.run("test")).toBe("bun test");
    expect(pm.run("start")).toBe("bun start");
    expect(pm.run("dev")).toBe("bun run dev");
    expect(pm.run("build")).toBe("bun run build");
  });
});
