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

  const remaining = scan.sourceFiles.length + scan.testFiles.length - (lines.length - 1);
  if (remaining > 0) {
    lines.push(`- ...and ${remaining} more files`);
  }

  return lines.join("\n");
}

function scriptRows(scan: ScanResult): string[][] {
  return scan.scripts.map((script) => [
    `\`${script.name}\``,
    script.description,
    `\`${script.command.replace(/\|/g, "\\|")}\``
  ]);
}

function envRows(scan: ScanResult): string[][] {
  return scan.envVariables.map((key) => [key, "Add your value"]);
}

export function generateReadme(scan: ScanResult, options: GenerateOptions): string {
  const sections: string[] = [];

  sections.push(`# ${scan.packageName}`);
  sections.push(scan.description);

  sections.push("## Features");
  sections.push(
    [
      "- Auto-generated README content",
      `- Project type detection (${scan.projectTypes.join(", ")})`,
      "- Script explanations",
      scan.envVariables.length > 0 ? "- Environment variable detection" : "- Optional environment variable support",
      scan.hasBin ? "- CLI usage section" : "- Package usage guidance"
    ].join("\n")
  );

  sections.push("## Installation");
  sections.push(["```bash", `npm install ${scan.packageName}`, "```"].join("\n"));

  sections.push("## Usage");
  const usageCommand = scan.scripts.find((script) => script.name === "start")
    ? "npm run start"
    : scan.scripts.find((script) => script.name === "dev")
      ? "npm run dev"
      : "npm run build";
  sections.push(["```bash", usageCommand, "```"].join("\n"));

  if (scan.hasBin && scan.binCommands.length > 0) {
    sections.push("## CLI Usage");
    const primary = scan.binCommands[0];
    sections.push(
      [
        "```bash",
        `${primary} --help`,
        `${primary} --output README.md`,
        `${primary} --dry-run`,
        "```"
      ].join("\n")
    );
  }

  if (scan.scripts.length > 0) {
    sections.push("## Available Scripts");
    sections.push(markdownTable(["Script", "Description", "Command"], scriptRows(scan)));
  }

  if (scan.envVariables.length > 0) {
    sections.push("## Environment Variables");
    sections.push(markdownTable(["Variable", "Description"], envRows(scan)));
  }

  if (options.includeTree) {
    sections.push("## Project Structure");
    sections.push(["```text", buildProjectTree(scan), "```"].join("\n"));
  }

  sections.push("## API / Exports");
  const exportsLines = [
    scan.exportsInfo.main ? `- Main entry: \`${scan.exportsInfo.main}\`` : "- Main entry: Not specified",
    scan.exportsInfo.module ? `- Module entry: \`${scan.exportsInfo.module}\`` : "- Module entry: Not specified",
    scan.exportsInfo.types ? `- Types entry: \`${scan.exportsInfo.types}\`` : "- Types entry: Not specified"
  ];
  sections.push(exportsLines.join("\n"));

  sections.push("## Development");
  sections.push(
    [
      "```bash",
      "npm install",
      "npm run check",
      "npm run build",
      scan.scripts.some((script) => script.name === "dev") ? "npm run dev" : "# add a dev script if needed",
      "```"
    ].join("\n")
  );

  if (options.includeChecklist) {
    sections.push("## Publishing Checklist");
    sections.push(
      [
        "- Update version in `package.json`",
        "- Run `npm run check`",
        "- Run `npm run build`",
        "- Verify generated README output",
        "- Run `npm publish --access public`"
      ].join("\n")
    );
  }

  sections.push("## License");
  sections.push(scan.license ? `Licensed under the ${scan.license} license.` : "Add your project license.");

  return `${sections.join("\n\n")}\n`;
}
