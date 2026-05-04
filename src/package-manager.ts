import { fileExists } from "./utils";
import path from "path";

export type PackageManagerName = "npm" | "pnpm" | "yarn" | "bun";

export interface PackageManager {
  name: PackageManagerName;
  install: string;
  run: (scriptName: string) => string;
  exec: (command: string) => string;
}

const PACKAGE_MANAGERS: Record<PackageManagerName, PackageManager> = {
  npm: {
    name: "npm",
    install: "npm install",
    run: (scriptName: string) => {
      // npm has shortcuts for test and start
      if (scriptName === "test" || scriptName === "start") {
        return `npm ${scriptName}`;
      }
      return `npm run ${scriptName}`;
    },
    exec: (command: string) => `npx ${command}`,
  },
  pnpm: {
    name: "pnpm",
    install: "pnpm install",
    run: (scriptName: string) => `pnpm ${scriptName}`,
    exec: (command: string) => `pnpm exec ${command}`,
  },
  yarn: {
    name: "yarn",
    install: "yarn install",
    run: (scriptName: string) => `yarn ${scriptName}`,
    exec: (command: string) => `yarn ${command}`,
  },
  bun: {
    name: "bun",
    install: "bun install",
    run: (scriptName: string) => {
      // bun has shortcuts for test and start
      if (scriptName === "test" || scriptName === "start") {
        return `bun ${scriptName}`;
      }
      return `bun run ${scriptName}`;
    },
    exec: (command: string) => `bunx ${command}`,
  },
};

const LOCK_FILE_ORDER: Array<{ file: string; manager: PackageManagerName }> = [
  { file: "package-lock.json", manager: "npm" },
  { file: "pnpm-lock.yaml", manager: "pnpm" },
  { file: "yarn.lock", manager: "yarn" },
  { file: "bun.lockb", manager: "bun" },
  { file: "bun.lock", manager: "bun" },
];

export async function detectPackageManager(
  rootDir: string,
): Promise<PackageManager> {
  for (const { file, manager } of LOCK_FILE_ORDER) {
    const lockFilePath = path.join(rootDir, file);
    if (await fileExists(lockFilePath)) {
      return PACKAGE_MANAGERS[manager];
    }
  }

  // Default to npm if no lock file found
  return PACKAGE_MANAGERS.npm;
}

export function getPackageManager(name: PackageManagerName): PackageManager {
  return PACKAGE_MANAGERS[name];
}
