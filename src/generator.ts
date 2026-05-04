import type { ScanResult } from "./scanner";
import { parseDependenciesTable } from "./languages/python";
import { getPackageManager } from "./package-manager";

export interface GenerateOptions {
  includeChecklist: boolean;
  includeTree: boolean;
}

function markdownTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [head, divider, body].filter(Boolean).join("\n");
}

function buildProjectTree(scan: ScanResult): string {
  const lines = ["."];

  for (const file of scan.sourceFiles.slice(0, 25)) {
    lines.push(`- ${file}`);
  }

  for (const file of scan.testFiles.slice(0, 10)) {
    lines.push(`- ${file}`);
  }

  const remaining =
    scan.sourceFiles.length + scan.testFiles.length - (lines.length - 1);
  if (remaining > 0) {
    lines.push(`- ...and ${remaining} more files`);
  }

  return lines.join("\n");
}

function scriptRows(scan: ScanResult): string[][] {
  return scan.scripts.map((script) => [
    `\`${script.name}\``,
    script.description,
    `\`${script.command.replace(/\|/g, "\\|")}\``,
  ]);
}

function envRows(scan: ScanResult): string[][] {
  return scan.envVariables.map((key) => [key, "Add your value"]);
}

function getFeatureBullets(scan: ScanResult): string[] {
  const features = [
    "Auto-generated README with project metadata",
    `Project type detection (${scan.projectTypes.join(", ")})`,
    "NPM scripts documentation with descriptions",
  ];

  if (scan.envVariables.length > 0) {
    features.push("Environment variables from .env.example");
  }

  if (scan.hasBin) {
    features.push("CLI usage examples");
  }

  if (scan.exportsInfo.types) {
    features.push("TypeScript type definitions included");
  }

  features.push("Clean, professional markdown formatting");

  return features.map((f) => `- ${f}`);
}

function getInstallationSection(scan: ScanResult): string {
  const pm = getPackageManager(scan.packageManager ?? "npm");
  const lines = ["## Installation"];

  lines.push("");
  lines.push("Install dependencies:");
  lines.push(["```bash", pm.install, "```"].join("\n"));

  if (scan.hasBin) {
    lines.push("");
    lines.push("Run the CLI (if installed globally or linked):");
    lines.push(["```bash", scan.binCommands[0] ?? scan.packageName, "```"].join("\n"));
  }

  lines.push("");
  lines.push("For local setup from repository:");
  lines.push(
    [
      "```bash",
      "git clone <repository-url>",
      "cd " + scan.packageName,
      pm.install,
      "```",
    ].join("\n"),
  );

  return lines.join("\n");
}

function getUsageSection(scan: ScanResult): string {
  const pm = getPackageManager(scan.packageManager ?? "npm");
  const lines = ["## Usage"];

  if (scan.hasBin && scan.binCommands.length > 0) {
    const primary = scan.binCommands[0];
    lines.push("");
    lines.push("Run the CLI:");
    lines.push(["```bash", primary, "```"].join("\n"));

    if (scan.binCommands.length > 1) {
      lines.push("");
      lines.push("Available commands:");
      scan.binCommands.forEach((cmd) => {
        lines.push(`- \`${cmd}\``);
      });
    }
  }

  // Add library usage example if it's not a CLI-only package
  if (!scan.hasBin || scan.exportsInfo.main || scan.exportsInfo.module) {
    lines.push("");
    lines.push("Import in your project:");
    lines.push(
      [
        "```javascript",
        `import ${scan.packageName.replace(/-/g, "")} from "${scan.packageName}";`,
        "",
        "// Use the package",
        `${scan.packageName.replace(/-/g, "")}.someFunction();`,
        "```",
      ].join("\n"),
    );
  }

  // Add package manager script usage if available
  const devScript = scan.scripts.find(
    (s) => s.name === "dev" || s.name === "start",
  );
  if (devScript) {
    lines.push("");
    lines.push("For development:");
    lines.push(["```bash", pm.run(devScript.name), "```"].join("\n"));
  }

  return lines.join("\n");
}

// Python-specific feature bullets
function getPythonFeatureBullets(scan: ScanResult): string[] {
  const features = [
    "Python project structure detection",
    "Installation instructions",
    "Development and testing commands",
  ];

  if (scan.pythonInfo?.framework === "django") {
    features.push("Django project detection");
    features.push("Local development server instructions");
    features.push("Django testing command");
  }

  if (scan.pythonInfo?.framework === "flask") {
    features.push("Flask project detection");
    features.push("Local app run instructions");
  }

  if (scan.envVariables.length > 0) {
    features.push("Environment variable documentation from .env.example");
  }

  features.push("Clean, professional markdown formatting");

  return features.map((f) => `- ${f}`);
}

// Python installation section
function getPythonInstallationSection(scan: ScanResult): string {
  const lines = ["## Installation"];
  lines.push("");

  const installCmd = scan.pythonInfo?.installCommand;
  if (installCmd) {
    lines.push("Install dependencies:");
    lines.push(["```bash", installCmd, "```"].join("\n"));
  } else {
    lines.push("Add your installation command here.");
    lines.push("");
    lines.push("```bash");
    lines.push("# Example: pip install -r requirements.txt");
    lines.push("```");
  }

  return lines.join("\n");
}

// Python usage section
function getPythonUsageSection(scan: ScanResult): string {
  const lines = ["## Usage"];
  lines.push("");

  const runCmd = scan.pythonInfo?.runCommand;
  if (runCmd) {
    lines.push("Run the project:");
    lines.push(["```bash", runCmd, "```"].join("\n"));
  } else {
    lines.push("Add your usage command here.");
    lines.push("");
    lines.push("```bash");
    lines.push("# Example: python main.py");
    lines.push("```");
  }

  return lines.join("\n");
}

// Python testing section
function getPythonTestingSection(scan: ScanResult): string {
  const lines = ["## Testing"];
  lines.push("");

  const testCmd = scan.pythonInfo?.testCommand;
  if (testCmd) {
    lines.push("Run tests:");
    lines.push(["```bash", testCmd, "```"].join("\n"));
  } else {
    lines.push("Add your testing command here.");
    lines.push("");
    lines.push("```bash");
    lines.push("# Example: pytest");
    lines.push("```");
  }

  return lines.join("\n");
}

// Python dependencies section
function getPythonDependenciesSection(scan: ScanResult): string {
  if (!scan.pythonInfo?.dependencies.length) {
    return "";
  }

  const lines = ["## Dependencies"];
  lines.push("");
  lines.push("| Package | Version |");
  lines.push("|---------|---------|");

  const deps = parseDependenciesTable(scan.pythonInfo.dependencies);
  deps.forEach(({ name, version }) => {
    lines.push(`| ${name} | ${version} |`);
  });

  return lines.join("\n");
}

// Python development section
function getPythonDevelopmentSection(scan: ScanResult): string {
  const lines = ["## Development"];
  lines.push("");
  lines.push("```bash");

  const pythonInfo = scan.pythonInfo;
  if (pythonInfo?.installCommand) {
    lines.push("# Install dependencies");
    lines.push(pythonInfo.installCommand);
  }
  if (pythonInfo?.runCommand) {
    lines.push("");
    lines.push("# Run the project");
    lines.push(pythonInfo.runCommand);
  }
  if (pythonInfo?.testCommand) {
    lines.push("");
    lines.push("# Run tests");
    lines.push(pythonInfo.testCommand);
  }

  lines.push("```");
  return lines.join("\n");
}

// Generate README for Python project
function generatePythonReadme(
  scan: ScanResult,
  options: GenerateOptions,
): string {
  const sections: string[] = [];

  // Title and description
  sections.push(`# ${scan.packageName}`);
  sections.push(scan.description);

  // Features
  sections.push("## Features");
  sections.push(getPythonFeatureBullets(scan).join("\n"));

  // Installation
  sections.push(getPythonInstallationSection(scan));

  // Usage
  sections.push(getPythonUsageSection(scan));

  // Testing
  sections.push(getPythonTestingSection(scan));

  // Dependencies
  const depsSection = getPythonDependenciesSection(scan);
  if (depsSection) {
    sections.push(depsSection);
  }

  // Environment Variables
  if (scan.envVariables.length > 0) {
    sections.push("## Environment Variables");
    sections.push("");
    sections.push("Create a `.env` file in your project root:");
    sections.push("");
    sections.push("| Variable | Description |");
    sections.push("|----------|-------------|");
    scan.envVariables.forEach((key) => {
      sections.push(`| \`${key}\` | Add your value |`);
    });
    sections.push("");
    sections.push("Copy from `.env.example` and fill in your values.");
  }

  // Project Structure
  if (options.includeTree) {
    sections.push("## Project Structure");
    sections.push("");
    sections.push("```text");
    sections.push(buildProjectTree(scan));
    sections.push("```");
  }

  // Development
  sections.push(getPythonDevelopmentSection(scan));

  // License
  sections.push("## License");
  sections.push("");
  if (scan.filePresence["LICENSE"]) {
    sections.push(
      "This project is licensed under the terms of the license included in the repository.",
    );
  } else {
    sections.push("Add your license information here.");
  }

  return `${sections.join("\n")}\n`;
}

// Generate README for JavaScript/TypeScript project (original)
function generateJavaScriptReadme(
  scan: ScanResult,
  options: GenerateOptions,
): string {
  const sections: string[] = [];

  // Title and description
  sections.push(`# ${scan.packageName}`);
  sections.push(scan.description);

  // Features
  sections.push("## Features");
  sections.push(getFeatureBullets(scan).join("\n"));

  // Installation
  sections.push(getInstallationSection(scan));

  // Usage
  sections.push(getUsageSection(scan));

  // CLI Usage (only if it's a CLI package)
  if (scan.hasBin && scan.binCommands.length > 0) {
    sections.push("## CLI Usage");
    const primary = scan.binCommands[0];
    sections.push("");
    sections.push("Basic commands:");
    sections.push(
      [
        "```bash",
        `${primary} --help         # Show help`,
        `${primary} --version      # Show version`,
        `${primary} --dry-run      # Preview README without writing`,
        `${primary} --output docs/README.md  # Custom output path`,
        "```",
      ].join("\n"),
    );
  }

  // Available Scripts
  if (scan.scripts.length > 0 && scan.packageManager) {
    const pm = getPackageManager(scan.packageManager);
    sections.push("## Available Scripts");
    sections.push("");
    sections.push("| Script | Description | Command |");
    sections.push("|--------|-------------|---------|");
    scan.scripts.forEach((script) => {
      const runCommand = pm.run(script.name);
      sections.push(
        `| \`${script.name}\` | ${script.description} | \`${runCommand}\` |`,
      );
    });
  }

  // Environment Variables
  if (scan.envVariables.length > 0) {
    sections.push("## Environment Variables");
    sections.push("");
    sections.push("Create a \`.env\` file in your project root:");
    sections.push("");
    sections.push("| Variable | Description | Required |");
    sections.push("|----------|-------------|----------|");
    scan.envVariables.forEach((key) => {
      sections.push(`| \`${key}\` | Add description | Yes/No |`);
    });
    sections.push("");
    sections.push("Copy from \`.env.example\` and fill in your values.");
  }

  // Project Structure
  if (options.includeTree) {
    sections.push("## Project Structure");
    sections.push("");
    sections.push("```text");
    sections.push(buildProjectTree(scan));
    sections.push("```");
  }

  // API / Exports
  sections.push("## API / Exports");
  sections.push("");
  if (
    scan.exportsInfo.main ||
    scan.exportsInfo.module ||
    scan.exportsInfo.types
  ) {
    const exportsInfo = [];
    if (scan.exportsInfo.main)
      exportsInfo.push(`- **Main**: \`${scan.exportsInfo.main}\``);
    if (scan.exportsInfo.module)
      exportsInfo.push(`- **Module**: \`${scan.exportsInfo.module}\``);
    if (scan.exportsInfo.types)
      exportsInfo.push(`- **Types**: \`${scan.exportsInfo.types}\``);
    sections.push(exportsInfo.join("\n"));
  } else {
    sections.push(
      "*No explicit exports defined. Check the package source for available exports.*",
    );
  }

  // Development
  const hasCheckScript = scan.scripts.some((s) => s.name === "check");
  const hasBuildScript = scan.scripts.some((s) => s.name === "build");
  const hasDevScript = scan.scripts.some((s) => s.name === "dev");
  const pm = scan.packageManager ? getPackageManager(scan.packageManager) : null;

  sections.push("## Development");
  sections.push("");
  sections.push("```bash");
  if (pm) {
    sections.push("# Install dependencies");
    sections.push(pm.install);
  }
  if (hasCheckScript) {
    sections.push("");
    sections.push("# Run type checking");
    if (pm) {
      sections.push(pm.run("check"));
    }
  }
  if (hasBuildScript && pm) {
    sections.push("");
    sections.push("# Build the project");
    sections.push(pm.run("build"));
  }
  if (hasDevScript && pm) {
    sections.push("");
    sections.push("# Start development mode");
    sections.push(pm.run("dev"));
  }
  sections.push("```");

  // Publishing Checklist
  if (options.includeChecklist) {
    sections.push("## Publishing Checklist");
    sections.push("");
    sections.push("Before publishing a new version:");
    sections.push("");
    sections.push("- [ ] Update version in `package.json`");
    sections.push("- [ ] Run `npm run check` to verify types");
    sections.push("- [ ] Run `npm run build` to verify build");
    sections.push("- [ ] Run `npm test` to verify tests");
    sections.push("- [ ] Review generated README output");
    sections.push("- [ ] Update `CHANGELOG.md` if applicable");
    sections.push("- [ ] Verify license file is present");
    sections.push("- [ ] Run `npm publish --access public`");
  }

  // License
  sections.push("## License");
  sections.push("");
  if (scan.license) {
    sections.push(
      `This project is licensed under the ${scan.license} License.`,
    );
    if (scan.author) {
      sections.push(
        `Copyright (c) ${new Date().getFullYear()} ${scan.author}.`,
      );
    }
  } else {
    sections.push("*License information not specified in package.json.*");
  }

  // Contributing section
  sections.push("## Contributing");
  sections.push("");
  sections.push(
    "Contributions are welcome! Please feel free to submit a Pull Request.",
  );
  if (scan.repository) {
    sections.push("");
    sections.push(`Repository: ${scan.repository}`);
  }

  return `${sections.join("\n")}\n`;
}

export function generateReadme(
  scan: ScanResult,
  options: GenerateOptions,
): string {
  if (scan.language === "python") {
    return generatePythonReadme(scan, options);
  }
  return generateJavaScriptReadme(scan, options);
}
