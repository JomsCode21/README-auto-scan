import type { ScanResult } from "./scanner";

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
  const lines = ["## Installation"];

  if (scan.hasBin) {
    lines.push("");
    lines.push("Install globally (optional):");
    lines.push(
      ["```bash", `npm install -g ${scan.packageName}`, "```"].join("\n"),
    );
    lines.push("");
    lines.push("Or use with npx (no installation):");
    lines.push(["```bash", `npx ${scan.packageName}`, "```"].join("\n"));
  } else {
    lines.push("");
    lines.push(
      ["```bash", `npm install ${scan.packageName}`, "```"].join("\n"),
    );
    lines.push("");
    lines.push("Or with yarn:");
    lines.push(["```bash", `yarn add ${scan.packageName}`, "```"].join("\n"));
  }

  lines.push("");
  lines.push("For local development:");
  lines.push(
    [
      "```bash",
      "git clone <repository-url>",
      "cd " + scan.packageName,
      "npm install",
      "```",
    ].join("\n"),
  );

  return lines.join("\n");
}

function getUsageSection(scan: ScanResult): string {
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

  // Add npm script usage if available
  const devScript = scan.scripts.find(
    (s) => s.name === "dev" || s.name === "start",
  );
  if (devScript) {
    lines.push("");
    lines.push("For development:");
    lines.push(["```bash", `npm run ${devScript.name}`, "```"].join("\n"));
  }

  return lines.join("\n");
}

export function generateReadme(
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
  if (scan.scripts.length > 0) {
    sections.push("## Available Scripts");
    sections.push("");
    sections.push("| Script | Description | Command |");
    sections.push("|--------|-------------|---------|");
    scan.scripts.forEach((script) => {
      const cleanCommand = script.command
        .replace(/\|/g, "\\|")
        .substring(0, 40);
      const displayCmd =
        script.command.length > 40 ? cleanCommand + "..." : cleanCommand;
      sections.push(
        `| \`${script.name}\` | ${script.description} | \`${displayCmd}\` |`,
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
  const devScript = scan.scripts.find((s) => s.name === "dev");
  const hasDevScript = !!devScript;

  sections.push("## Development");
  sections.push("");
  sections.push("```bash");
  sections.push("# Install dependencies");
  sections.push("npm install");
  sections.push("");
  sections.push("# Run type checking");
  sections.push("npm run check");
  sections.push("");
  sections.push("# Build the project");
  sections.push("npm run build");
  if (hasDevScript) {
    sections.push("");
    sections.push("# Start development mode");
    sections.push("npm run dev");
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
