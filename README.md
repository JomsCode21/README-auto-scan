# README Auto Scan

[![npm version](https://img.shields.io/npm/v/readme-autoscan.svg?style=flat-square)](https://www.npmjs.com/package/readme-autoscan)
[![npm downloads](https://img.shields.io/npm/dm/readme-autoscan.svg)](https://www.npmjs.com/package/readme-autoscan)
[![license](https://img.shields.io/npm/l/readme-autoscan.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/JomsCode21/README-auto-scan.svg)](https://github.com/JomsCode21/README-auto-scan/stargazers)

> CLI tool that scans JavaScript, TypeScript, Python, and PHP projects and automatically generates clean README.md files with installation, usage, scripts, environment variables, and publishing checklist.

## Features

- **Multi-Language Support** — JavaScript, TypeScript, Python, and PHP projects
- **Smart Project Detection** — Automatically detects project types (Node.js, React, Vue, Next.js, Vite, Express, TypeScript, CLI packages, Python, Django, Flask)
- **Package Manager Detection** — npm, pnpm, yarn, bun for JS/TS; pip, Poetry, Pipenv for Python; Composer for PHP
- **Package.json Analysis** — Extracts metadata, scripts, dependencies, exports, and repository info
- **Auto-Generated Documentation** — Creates professional README sections with proper formatting
- **Environment Variables** — Parses `.env.example` and includes variable tables
- **NPM Scripts Table** — Generates markdown tables with human-readable script descriptions
- **Python Dependencies** — Parses requirements.txt and includes dependency tables
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

| Option | Description |
| ------ | ----------- |
| `--output <file>` | Write README to a custom file (default: README.md) |
| `--force` | Overwrite existing README.md |
| `--dry-run` | Print generated README without writing a file |
| `--include-tree` | Include project structure in the README |
| `--no-checklist` | Skip publishing checklist section |
| `-v, --version` | Show package version |
| `-h, --help` | Show help message |

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

| Type | Detection Criteria |
| ---- | ------------------ |
| CLI Package | Has `bin` field in package.json |
| TypeScript | Has `typescript` dependency or `tsconfig.json` |
| React App | Has `react` dependency |
| Vue App | Has `vue` dependency |
| Next.js | Has `next` dependency or `next.config.js` |
| Vite | Has `vite` dependency or `vite.config.*` |
| Express | Has `express` dependency |
| Python | Has `requirements.txt`, `pyproject.toml`, `setup.py`, etc. |
| Django | Has `manage.py` or `django` in dependencies |
| Flask | Has `app.py` or `flask` in dependencies |
| Laravel | Has `artisan` or `laravel/framework` in composer requirements |

## Multi-Language Support

README Auto Scan supports JavaScript, TypeScript, Python, and PHP projects.

| Language | Detection Files |
| -------- | --------------- |
| JavaScript/TypeScript | `package.json`, `tsconfig.json`, `vite.config.*`, `next.config.js` |
| Python | `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`, `poetry.lock`, `main.py`, `app.py`, `manage.py` |
| PHP | `composer.json`, `composer.lock`, `index.php`, `artisan`, `phpunit.xml`, `phpunit.xml.dist` |

### JavaScript/TypeScript Package Manager Detection

README Auto Scan automatically detects your package manager from lock files and generates matching commands.

| Lock File | Package Manager |
| --------- | --------------- |
| `package-lock.json` | npm |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `bun.lockb` or `bun.lock` | bun |

Example with pnpm:

```bash
pnpm install
pnpm dev
pnpm build
```

### Python Support

README Auto Scan detects common Python project files and generates Python-friendly README sections.

| Python Tool | Detection File | Example Commands |
| ----------- | -------------- | ---------------- |
| pip | `requirements.txt` | `pip install -r requirements.txt` |
| Poetry | `pyproject.toml`, `poetry.lock` | `poetry install` |
| Pipenv | `Pipfile` | `pipenv install` |
| Django | `manage.py` | `python manage.py runserver` |

Example Python README output:

```markdown
# my-python-project

A Python project.

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Python Example

Run the application:

\`\`\`bash
python main.py
\`\`\`

Run tests:

\`\`\`bash
pytest
\`\`\`

Dependencies:

| Package | Version |
| ------- | ------- |
| requests | latest |
| flask | ==3.0.0 |
```

### PHP and Laravel Support

README Auto Scan detects common PHP and Laravel project files and generates PHP-friendly README sections.

| PHP Type | Detection Files |
| -------- | ---------------- |
| Basic PHP | `index.php`, `composer.json` |
| Composer | `composer.json`, `composer.lock` |
| Laravel | `artisan`, `routes/web.php`, `routes/api.php`, `bootstrap/app.php`, `app/Http` |
| PHPUnit | `phpunit.xml`, `phpunit.xml.dist` |

| PHP Tool | Example Commands |
| -------- | ---------------- |
| Composer | `composer install` |
| Laravel Artisan | `php artisan serve` |
| Laravel Tests | `php artisan test` |
| PHPUnit | `vendor/bin/phpunit` |

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
│  ├─ cli.ts                 # CLI entry point and argument parsing
│  ├─ scanner.ts             # Project scanning and analysis
│  ├─ detector.ts            # Project type detection
│  ├─ generator.ts           # README markdown generation
│  ├─ env.ts                 # .env.example parsing
│  ├─ scripts.ts             # NPM script descriptions
│  ├─ package-manager.ts    # Package manager detection
│  ├─ utils.ts               # Utility functions
│  └─ languages/
│     ├─ python.ts           # Python project detection
│     └─ php.ts              # PHP/Laravel project detection
├─ tests/
│  ├─ generator.test.ts
│  ├─ package-manager.test.ts
│  ├─ scripts.test.ts
│  ├─ utils.test.ts
│  ├─ env.test.ts
│  └─ python.test.ts         # Python detection tests
├─ bin/
│  └─ readme-autoscan.js     # Executable entry point
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

## Generated README Examples

README Auto Scan includes example generated README files for all supported project types. Use these examples to preview the README style before running the CLI in your own project.

| Project Type | Example |
| ------------ | ------- |
| JavaScript Package | [`examples/javascript-package/README.generated.md`](./examples/javascript-package/README.generated.md) |
| TypeScript Package | [`examples/typescript-package/README.generated.md`](./examples/typescript-package/README.generated.md) |
| Python pip Project | [`examples/python-pip/README.generated.md`](./examples/python-pip/README.generated.md) |
| Python Poetry Project | [`examples/python-poetry/README.generated.md`](./examples/python-poetry/README.generated.md) |
| Python Pipenv Project | [`examples/python-pipenv/README.generated.md`](./examples/python-pipenv/README.generated.md) |
| Python Django Project | [`examples/python-django/README.generated.md`](./examples/python-django/README.generated.md) |
| Basic PHP Project | [`examples/php-basic/README.generated.md`](./examples/php-basic/README.generated.md) |
| Laravel Project | [`examples/php-laravel/README.generated.md`](./examples/php-laravel/README.generated.md) |

Preview an example locally:

```bash
cd examples/python-pip
npx readme-autoscan --dry-run
```

See [`examples/README.md`](./examples/README.md) for more details.

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

Made for the JavaScript, TypeScript, Python, and PHP community
