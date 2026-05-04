# README Auto Scan

[![npm version](https://img.shields.io/npm/v/readme-autoscan.svg)](https://www.npmjs.com/package/readme-autoscan)
[![npm downloads](https://img.shields.io/npm/dm/readme-autoscan.svg)](https://www.npmjs.com/package/readme-autoscan)
[![license](https://img.shields.io/npm/l/readme-autoscan.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/JomsCode21/README-auto-scan.svg)](https://github.com/JomsCode21/README-auto-scan/stargazers)

> CLI tool that scans JavaScript and TypeScript projects and automatically generates clean README.md files with installation, usage, scripts, environment variables, and publishing checklist.

## Features

- **Smart Project Detection** — Automatically detects project types (Node.js, React, Vue, Next.js, Vite, Express, TypeScript, CLI packages)
- **Package.json Analysis** — Extracts metadata, scripts, dependencies, exports, and repository info
- **Auto-Generated Documentation** — Creates professional README sections with proper formatting
- **Environment Variables** — Parses `.env.example` and includes variable tables
- **NPM Scripts Table** — Generates markdown tables with human-readable script descriptions
- **Safe by Default** — Won't overwrite existing files without `--force` flag
- **CLI & Library Support** — Handles both CLI packages and regular npm libraries
- **Project Structure** — Optional file tree with `--include-tree`
- **Publishing Checklist** — Built-in checklist for npm package releases

## Installation

### Global Installation

```bash
npm install -g readme-autoscan
```

### Using npx (No Installation Required)

```bash
npx readme-autoscan
```

### Local Development

```bash
git clone https://github.com/JomsCode21/README-auto-scan.git
cd README-auto-scan
npm install
npm run build
```

## Usage

Generate a README.md in the current directory:

```bash
readme-autoscan
```

Preview the output without writing a file:

```bash
readme-autoscan --dry-run
```

Write to a custom location:

```bash
readme-autoscan --output docs/README.md
```

Overwrite an existing README.md:

```bash
readme-autoscan --force
```

Include the project file tree:

```bash
readme-autoscan --include-tree
```

Skip the publishing checklist:

```bash
readme-autoscan --no-checklist
```

### Examples

```bash
readme-autoscan
readme-autoscan --dry-run
readme-autoscan --output docs/README.md
readme-autoscan --force
readme-autoscan --include-tree
readme-autoscan --no-checklist
```

## CLI Options

| Option            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `--output <file>` | Write README to a custom file (default: README.md) |
| `--force`         | Overwrite existing README.md                       |
| `--dry-run`       | Print generated README without writing a file      |
| `--include-tree`  | Include project structure in the README            |
| `--no-checklist`  | Skip publishing checklist section                  |
| `-v, --version`   | Show package version                               |
| `-h, --help`      | Show help message                                  |

## Example Output

Here's what a generated README looks like:

```markdown
# my-awesome-package

A fantastic package that does amazing things.

## Features

- Auto-generated README with project metadata
- Project type detection (Node.js package, TypeScript package)
- NPM scripts documentation with descriptions
- Clean, professional markdown formatting

## Installation

\`\`\`bash
npm install my-awesome-package
\`\`\`

## Usage

\`\`\`javascript
import myawesomepackage from "my-awesome-package";

// Use the package
myawesomepackage.someFunction();
\`\`\`

## Available Scripts

| Script | Description              | Command             |
| ------ | ------------------------ | ------------------- |
| dev    | Start development server | `vite`              |
| build  | Build for production     | `tsc && vite build` |
| test   | Run test suite           | `vitest`            |

## License

This project is licensed under the MIT License.
```

## Project Type Detection

README Auto Scan automatically detects these project types:

| Type        | Detection Criteria                             |
| ----------- | ---------------------------------------------- |
| CLI Package | Has `bin` field in package.json                |
| TypeScript  | Has `typescript` dependency or `tsconfig.json` |
| React App   | Has `react` dependency                         |
| Vue App     | Has `vue` dependency                           |
| Next.js     | Has `next` dependency or `next.config.js`      |
| Vite        | Has `vite` dependency or `vite.config.*`       |
| Express     | Has `express` dependency                       |

## Package Manager Detection

README Auto Scan automatically detects your package manager from lock files and generates matching commands in Installation, Available Scripts, and Development sections.

| Lock File                      | Package Manager |
| ------------------------------ | --------------- |
| `package-lock.json`            | npm             |
| `pnpm-lock.yaml`               | pnpm            |
| `yarn.lock`                    | yarn            |
| `bun.lockb` or `bun.lock`      | bun             |

If no supported lock file is found, it falls back to npm.

Example: if your project contains `pnpm-lock.yaml`, generated commands use:

```bash
pnpm install
pnpm dev
pnpm build
```

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run check

# Build the project
npm run build

# Run tests
npm test

# Preview generated README for this project
npm run dev
```

## Project Structure

```text
readme-autoscan/
├─ src/
│  ├─ cli.ts              # CLI entry point and argument parsing
│  ├─ scanner.ts          # Project scanning and analysis
│  ├─ detector.ts         # Project type detection
│  ├─ generator.ts        # README markdown generation
│  ├─ env.ts              # .env.example parsing
│  ├─ scripts.ts          # NPM script descriptions
│  ├─ package-manager.ts  # Package manager detection
│  └─ utils.ts            # Utility functions
├─ tests/
│  ├─ generator.test.ts
│  ├─ package-manager.test.ts
│  ├─ scripts.test.ts
│  ├─ utils.test.ts
│  └─ env.test.ts
├─ bin/
│  └─ readme-autoscan.js  # Executable entry point
├─ package.json
├─ tsconfig.json
├─ README.md
└─ LICENSE
```

## Generated README Sections

The tool generates these sections based on your project:

1. **Title & Description** — From package.json
2. **Features** — Auto-detected capabilities
3. **Installation** — NPM install instructions
4. **Usage** — CLI or library usage examples
5. **CLI Usage** — If it's a CLI package
6. **Available Scripts** — Markdown table from package.json
7. **Environment Variables** — From .env.example
8. **Project Structure** — With `--include-tree`
9. **API / Exports** — Main/module/types entries
10. **Development** — Setup instructions
11. **Publishing Checklist** — For npm packages
12. **License** — From package.json
13. **Contributing** — Standard contribution message

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 JomsCode21

## Links

- **Repository:** [github.com/JomsCode21/README-auto-scan](https://github.com/JomsCode21/README-auto-scan)
- **Issues:** [github.com/JomsCode21/README-auto-scan/issues](https://github.com/JomsCode21/README-auto-scan/issues)
- **NPM Package:** [npmjs.com/package/readme-autoscan](https://www.npmjs.com/package/readme-autoscan)

---

Made for the JavaScript/TypeScript community
