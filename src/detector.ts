export interface DetectionInput {
  dependencies: string[];
  devDependencies: string[];
  filePresence: Record<string, boolean>;
  hasBin: boolean;
}

export function detectProjectTypes(input: DetectionInput): string[] {
  const deps = new Set([...input.dependencies, ...input.devDependencies]);
  const types = new Set<string>();

  types.add("Node.js package");

  if (input.hasBin) {
    types.add("CLI package");
  }

  if (deps.has("typescript") || input.filePresence["tsconfig.json"]) {
    types.add("TypeScript package");
  }

  if (deps.has("next") || input.filePresence["next.config.js"]) {
    types.add("Next.js app");
  }

  const hasVite =
    deps.has("vite") ||
    input.filePresence["vite.config.ts"] ||
    input.filePresence["vite.config.js"];

  if (hasVite) {
    types.add("Vite app");
  }

  const hasReact = deps.has("react") || deps.has("react-dom");
  const hasVue = deps.has("vue");

  if (hasReact) {
    types.add("React app");
  }

  if (hasVue) {
    types.add("Vue app");
  }

  if (hasVite && hasReact) {
    types.add("Vite React app");
  }

  if (hasVite && hasVue) {
    types.add("Vite Vue app");
  }

  if (deps.has("express")) {
    types.add("Express app");
  }

  return [...types];
}
