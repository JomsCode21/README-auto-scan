# readme-autoscan

CLI tool that scans JavaScript/TypeScript projects and generates a clean `README.md` automatically.

## Features

- Scans `package.json` metadata, scripts, dependencies, exports, author, and repository info.
- Detects common project types (Node, CLI, React, Vue, Next.js, Vite, Express, TypeScript).
- Parses `.env.example` and adds an environment variable table.
- Generates clean README sections with installation, usage, scripts, project structure, exports, and license.
- Supports safe write behavior with `--force`, `--dry-run`, and custom output paths.

## Installation

```bash
npm install readme-autoscan
```

## Usage

```bash
npx readme-autoscan
npx readme-autoscan --output README.md
npx readme-autoscan --dry-run
npx readme-autoscan --force
```

## CLI Options

- `--output <file>`: Write README to a custom file.
- `--force`: Overwrite existing output file.
- `--dry-run`: Print generated README in the terminal.
- `--no-checklist`: Skip publishing checklist section.
- `--include-tree`: Include project structure in output.
- `--help`: Show usage instructions.

## Project Structure

```text
readme-autoscan/
├─ src/
│  ├─ cli.ts
│  ├─ scanner.ts
│  ├─ detector.ts
│  ├─ generator.ts
│  ├─ env.ts
│  ├─ scripts.ts
│  └─ utils.ts
├─ bin/
│  └─ readme-autoscan.js
├─ package.json
├─ tsconfig.json
├─ README.md
└─ LICENSE
```

## Development

```bash
npm install
npm run check
npm run build
npm run dev
```

## License

MIT
