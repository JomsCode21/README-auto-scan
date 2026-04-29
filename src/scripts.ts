const SCRIPT_DESCRIPTIONS: Record<string, string> = {
  dev: "Start development server",
  build: "Build the project",
  test: "Run tests",
  lint: "Run lint checks",
  start: "Start production app",
  check: "Run project checks",
  format: "Format source code",
  prepare: "Run package preparation steps"
};

function inferDescription(name: string, command: string): string {
  if (SCRIPT_DESCRIPTIONS[name]) {
    return SCRIPT_DESCRIPTIONS[name];
  }

  if (/vite|next dev|webpack serve|nodemon/.test(command)) {
    return "Run development mode";
  }

  if (/jest|vitest|mocha|cypress/.test(command)) {
    return "Run automated tests";
  }

  if (/eslint|tsc --noEmit/.test(command)) {
    return "Run static analysis";
  }

  return "Custom npm script";
}

export function explainScripts(
  scripts: Record<string, string>
): Array<{ name: string; command: string; description: string }> {
  return Object.entries(scripts).map(([name, command]) => ({
    name,
    command,
    description: inferDescription(name, command)
  }));
}
