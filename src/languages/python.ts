import path from "path";
import { fileExists, readFile } from "../utils";

export type PythonTool = "pip" | "poetry" | "pipenv" | "none";
export type PythonFramework = "django" | "flask" | null;

export interface PythonProjectInfo {
  language: "Python";
  projectName: string;
  description: string;
  framework: PythonFramework;
  tool: PythonTool;
  installCommand: string;
  runCommand: string;
  testCommand: string;
  buildCommand: string | null;
  dependencies: string[];
  entryFile: string | null;
}

// Files that indicate a Python project
const PYTHON_FILES = [
  "requirements.txt",
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "Pipfile",
  "poetry.lock",
  "main.py",
  "app.py",
  "manage.py",
];

export async function detectPythonProject(rootDir: string): Promise<boolean> {
  // Only detect Python if no package.json exists (preserve JS/TS priority)
  const hasPackageJson = await fileExists(path.join(rootDir, "package.json"));
  if (hasPackageJson) {
    return false;
  }

  for (const file of PYTHON_FILES) {
    if (await fileExists(path.join(rootDir, file))) {
      return true;
    }
  }

  return false;
}

export async function detectPythonTool(rootDir: string): Promise<PythonTool> {
  // Poetry: poetry.lock or pyproject.toml with [tool.poetry]
  if (await fileExists(path.join(rootDir, "poetry.lock"))) {
    return "poetry";
  }

  const pyprojectPath = path.join(rootDir, "pyproject.toml");
  if (await fileExists(pyprojectPath)) {
    const content = await readFile(pyprojectPath, "utf8").catch(() => "");
    if (content.includes("[tool.poetry]") || content.includes("poetry-core")) {
      return "poetry";
    }
  }

  // Pipenv: Pipfile
  if (await fileExists(path.join(rootDir, "Pipfile"))) {
    return "pipenv";
  }

  // pip: requirements.txt
  if (await fileExists(path.join(rootDir, "requirements.txt"))) {
    return "pip";
  }

  return "none";
}

export async function detectPythonFramework(
  rootDir: string,
  dependencies: string[],
): Promise<PythonFramework> {
  // Django: manage.py exists
  if (await fileExists(path.join(rootDir, "manage.py"))) {
    return "django";
  }

  // Check dependencies for Django
  const hasDjango = dependencies.some(
    (dep) => dep.toLowerCase() === "django" || dep.toLowerCase().startsWith("django"),
  );
  if (hasDjango) {
    return "django";
  }

  // Flask: app.py exists
  if (await fileExists(path.join(rootDir, "app.py"))) {
    return "flask";
  }

  // Check dependencies for Flask
  const hasFlask = dependencies.some(
    (dep) => dep.toLowerCase() === "flask" || dep.toLowerCase().startsWith("flask"),
  );
  if (hasFlask) {
    return "flask";
  }

  return null;
}

export async function parseRequirementsTxt(rootDir: string): Promise<string[]> {
  const reqPath = path.join(rootDir, "requirements.txt");
  if (!(await fileExists(reqPath))) {
    return [];
  }

  const content = await readFile(reqPath, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function parseDependencyLine(line: string): { name: string; version: string } {
  // Match: package, package==1.0, package>=1.0, package~=1.0, package[extra]>=1.0
  const match = line.match(/^([a-zA-Z0-9_-]+)(.*)$/);
  if (!match) {
    return { name: line, version: "specified" };
  }

  const name = match[1];
  const versionSpec = match[2]?.trim();

  return { name, version: versionSpec || "latest" };
}

export function parseDependenciesTable(
  dependencies: string[],
): Array<{ name: string; version: string }> {
  return dependencies.map((line: string) => parseDependencyLine(line));
}

export function getPythonCommands(
  tool: PythonTool,
  framework: PythonFramework,
  entryFile: string | null,
): {
  installCommand: string;
  runCommand: string;
  testCommand: string;
  buildCommand: string | null;
} {
  // Django commands
  if (framework === "django") {
    switch (tool) {
      case "pip":
        return {
          installCommand: "pip install -r requirements.txt",
          runCommand: "python manage.py runserver",
          testCommand: "python manage.py test",
          buildCommand: null,
        };
      case "poetry":
        return {
          installCommand: "poetry install",
          runCommand: "poetry run python manage.py runserver",
          testCommand: "poetry run python manage.py test",
          buildCommand: null,
        };
      case "pipenv":
        return {
          installCommand: "pipenv install",
          runCommand: "pipenv run python manage.py runserver",
          testCommand: "pipenv run python manage.py test",
          buildCommand: null,
        };
      default:
        return {
          installCommand: "",
          runCommand: "python manage.py runserver",
          testCommand: "python manage.py test",
          buildCommand: null,
        };
    }
  }

  // Regular Python commands
  const runFile = entryFile || "your_script.py";

  switch (tool) {
    case "pip":
      return {
        installCommand: "pip install -r requirements.txt",
        runCommand: `python ${runFile}`,
        testCommand: "pytest",
        buildCommand: null,
      };
    case "poetry":
      return {
        installCommand: "poetry install",
        runCommand: `poetry run python ${runFile}`,
        testCommand: "poetry run pytest",
        buildCommand: null,
      };
    case "pipenv":
      return {
        installCommand: "pipenv install",
        runCommand: `pipenv run python ${runFile}`,
        testCommand: "pipenv run pytest",
        buildCommand: null,
      };
    default:
      return {
        installCommand: "",
        runCommand: `python ${runFile}`,
        testCommand: "pytest",
        buildCommand: null,
      };
  }
}

export async function getPythonProjectInfo(rootDir: string): Promise<PythonProjectInfo> {
  const tool = await detectPythonTool(rootDir);
  const dependencies = await parseRequirementsTxt(rootDir);
  const framework = await detectPythonFramework(rootDir, dependencies);

  // Determine entry file
  let entryFile: string | null = null;
  if (await fileExists(path.join(rootDir, "main.py"))) {
    entryFile = "main.py";
  } else if (await fileExists(path.join(rootDir, "app.py"))) {
    entryFile = "app.py";
  }

  const commands = getPythonCommands(tool, framework, entryFile);

  // Get project name and description from pyproject.toml if available
  let projectName = path.basename(rootDir);
  let description = "A Python project.";

  const pyprojectPath = path.join(rootDir, "pyproject.toml");
  if (await fileExists(pyprojectPath)) {
    const content = await readFile(pyprojectPath, "utf8").catch(() => "");

    const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
    if (nameMatch) {
      projectName = nameMatch[1];
    }

    const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
    if (descMatch) {
      description = descMatch[1];
    }
  }

  return {
    language: "Python",
    projectName,
    description,
    framework,
    tool,
    installCommand: commands.installCommand,
    runCommand: commands.runCommand,
    testCommand: commands.testCommand,
    buildCommand: commands.buildCommand,
    dependencies,
    entryFile,
  };
}
