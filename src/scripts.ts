const SCRIPT_DESCRIPTIONS: Record<string, string> = {
  dev: "Start development server",
  start: "Start the app",
  build: "Build the project",
  test: "Run tests",
  "test:watch": "Run tests in watch mode",
  lint: "Run lint checks",
  "lint:fix": "Fix lint issues",
  format: "Format code",
  typecheck: "Run TypeScript checks",
  "type-check": "Run TypeScript checks",
  preview: "Preview production build",
  clean: "Remove generated files",
  prepare: "Prepare package before publishing",
  prepublishOnly: "Run checks before npm publish",
  release: "Create a new release",
  docs: "Generate documentation",
  storybook: "Start Storybook",
  "build:storybook": "Build Storybook",
  coverage: "Run tests with coverage",
  check: "Run project checks",
  ci: "Run CI checks",
  type: "Run TypeScript checks",
  "format:fix": "Fix formatting automatically",
  "storybook:build": "Build Storybook",
  "test:coverage": "Run tests with coverage",
  "test:e2e": "Run end-to-end tests",
  "test:unit": "Run unit tests",
  prebuild: "Run before build",
  postbuild: "Run after build",
  prepublish: "Run before publishing",
  postpublish: "Run after publishing",
  preinstall: "Run before install",
  postinstall: "Run after install",
  watch: "Watch files for changes",
  serve: "Serve static files",
  deploy: "Deploy to production",
  changelog: "Generate changelog",
  analyze: "Analyze bundle size",
  eject: "Eject from framework",
};

function inferDescription(name: string, command: string): string {
  // Direct match
  if (SCRIPT_DESCRIPTIONS[name]) {
    return SCRIPT_DESCRIPTIONS[name];
  }

  // Common prefixes/suffixes patterns
  if (name.startsWith("lint:")) {
    return `Run ${name.slice(5)} linting`;
  }

  if (name.startsWith("format:")) {
    return `Format ${name.slice(7)} files`;
  }

  if (name.startsWith("test:")) {
    return `Run ${name.slice(5)} tests`;
  }

  if (name.startsWith("build:")) {
    return `Build ${name.slice(6)} target`;
  }

  if (name.startsWith("dev:")) {
    return `Start ${name.slice(4)} development`;
  }

  // Command pattern matching
  const cmd = command.toLowerCase();

  if (/vite|next dev|webpack serve|nodemon|tsx watch/.test(cmd)) {
    return "Start development server with hot reload";
  }

  if (/jest|vitest|mocha|ava|tap|cypress|playwright/.test(cmd)) {
    if (/watch|--watch/.test(cmd)) {
      return "Run tests in watch mode";
    }
    if (/coverage|--coverage/.test(cmd)) {
      return "Run tests with coverage report";
    }
    return "Run automated tests";
  }

  if (/eslint|tslint|biome check/.test(cmd)) {
    if (/fix|--fix/.test(cmd)) {
      return "Fix linting issues automatically";
    }
    return "Run lint checks";
  }

  if (/prettier|biome format/.test(cmd)) {
    if (/write|--write/.test(cmd)) {
      return "Format files in-place";
    }
    return "Check code formatting";
  }

  if (/tsc|tsc --noemit|typescript|typecheck/.test(cmd)) {
    return "Check TypeScript types";
  }

  if (/rollup|webpack|esbuild|parcel|vite build/.test(cmd)) {
    return "Build project for production";
  }

  if (/node.*dist|start.*server|serve/.test(cmd)) {
    return "Start production server";
  }

  if (/rm -rf|rimraf|del|trash/.test(cmd)) {
    return "Clean build artifacts";
  }

  if (/git.*tag|standard-version|changeset/.test(cmd)) {
    return "Create release/version";
  }

  if (/typedoc|jsdoc|documentation/.test(cmd)) {
    return "Generate documentation";
  }

  // Default fallback
  return `Run the ${name} script`;
}

export function explainScripts(
  scripts: Record<string, string>,
): Array<{ name: string; command: string; description: string }> {
  return Object.entries(scripts).map(([name, command]) => ({
    name,
    command,
    description: inferDescription(name, command),
  }));
}
