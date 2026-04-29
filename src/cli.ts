import { Command } from "commander";
import { constants } from "fs";
import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import pc from "picocolors";
import process from "process";
import { generateReadme } from "./generator";
import { scanProject } from "./scanner";

// Get version from package.json
const { version } = require("../package.json");

interface CliOptions {
  output: string;
  force: boolean;
  dryRun: boolean;
  checklist: boolean;
  includeTree: boolean;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function formatHelp(): string {
  return `
${pc.bold("README Auto Scan")}

Scan a JavaScript or TypeScript project and generate a clean README.md automatically.

${pc.bold("Usage:")}
  readme-autoscan [options]

${pc.bold("Options:")}
  --output <file>     Write README to a custom file (default: README.md)
  --force             Overwrite existing README.md
  --dry-run           Print generated README without writing a file
  --include-tree      Include project structure in the README
  --no-checklist      Skip publishing checklist section
  -v, --version       Show package version
  -h, --help          Show this help message

${pc.bold("Examples:")}
  readme-autoscan                          Generate README.md in current directory
  readme-autoscan --dry-run                Preview README without writing
  readme-autoscan --output docs/README.md  Write to custom location
  readme-autoscan --force                  Overwrite existing README.md
  readme-autoscan --include-tree           Include project file tree
`;
}

async function run(options: CliOptions): Promise<void> {
  const rootDir = process.cwd();
  const targetPath = path.resolve(rootDir, options.output);

  let scan;
  try {
    scan = await scanProject(rootDir);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("No package.json found")
    ) {
      throw new Error(
        "No package.json found. Please run this command inside a Node.js project.",
      );
    }
    throw error;
  }

  const markdown = generateReadme(scan, {
    includeChecklist: options.checklist,
    includeTree: options.includeTree,
  });

  if (options.dryRun) {
    console.log(markdown);
    console.log(
      pc.cyan(
        "\n✓ README preview generated with --dry-run. No file was written.",
      ),
    );
    return;
  }

  if ((await exists(targetPath)) && !options.force) {
    throw new Error(
      `README.md already exists. Use --force to overwrite it or --output to write to another file.`,
    );
  }

  try {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, markdown, "utf8");
  } catch (error) {
    throw new Error(
      "Failed to write README.md. Please check your file permissions.",
    );
  }

  const relativePath = path.relative(rootDir, targetPath);
  console.log(
    pc.green(`✓ README.md generated successfully at ${relativePath}`),
  );
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const args = argv.slice(2);

  // Handle help flag manually for custom formatting
  if (args.includes("-h") || args.includes("--help")) {
    console.log(formatHelp());
    return;
  }

  // Handle version flag manually
  if (args.includes("-v") || args.includes("--version")) {
    console.log(version);
    return;
  }

  const program = new Command();

  program
    .name("readme-autoscan")
    .description("Scan a JS/TS project and generate a clean README.md")
    .option("--output <file>", "Write README to a custom file", "README.md")
    .option("--force", "Overwrite existing output file")
    .option("--dry-run", "Print generated README in terminal")
    .option("--no-checklist", "Skip publishing checklist section")
    .option("--include-tree", "Include project structure tree")
    .helpOption("--help", "Show usage instructions")
    .version(version, "-v, --version", "Show package version")
    .action(async (opts: CliOptions) => {
      try {
        await run(opts);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(pc.red(`✗ Error: ${message}`));
        process.exitCode = 1;
      }
    });

  await program.parseAsync(argv);
}

if (require.main === module) {
  runCli().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(pc.red(`Fatal error: ${message}`));
    process.exit(1);
  });
}
