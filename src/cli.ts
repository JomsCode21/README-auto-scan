import { Command } from "commander";
import { constants } from "fs";
import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import pc from "picocolors";
import process from "process";
import { generateReadme } from "./generator";
import { scanProject } from "./scanner";

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

async function run(options: CliOptions): Promise<void> {
  const rootDir = process.cwd();
  const targetPath = path.resolve(rootDir, options.output);

  const scan = await scanProject(rootDir);
  const markdown = generateReadme(scan, {
    includeChecklist: options.checklist,
    includeTree: options.includeTree,
  });

  if (options.dryRun) {
    console.log(markdown);
    console.log(pc.cyan("\nDry run complete. No file was written."));
    return;
  }

  if ((await exists(targetPath)) && !options.force) {
    throw new Error(
      `Output file already exists: ${path.relative(rootDir, targetPath)}. Use --force to overwrite.`,
    );
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, markdown, "utf8");

  console.log(
    pc.green(
      `README generated successfully at ${path.relative(rootDir, targetPath)}`,
    ),
  );
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
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
    .action(async (opts: CliOptions) => {
      try {
        await run(opts);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(pc.red(`Error: ${message}`));
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
