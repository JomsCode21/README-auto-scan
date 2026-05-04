import { describe, expect, it, vi } from "vitest";
import {
  detectPythonProject,
  detectPythonTool,
  detectPythonFramework,
  parseRequirementsTxt,
  parseDependenciesTable,
  getPythonCommands,
  getPythonProjectInfo,
} from "../src/languages/python";
import * as utils from "../src/utils";

function hasFilePath(filePath: string, fileName: string): boolean {
  return (
    filePath.endsWith(`/${fileName}`) || filePath.endsWith(`\\${fileName}`)
  );
}

describe("detectPythonProject", () => {
  it("detects Python from requirements.txt", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "requirements.txt");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from pyproject.toml", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "pyproject.toml");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from setup.py", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "setup.py");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from Pipfile", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "Pipfile");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from poetry.lock", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "poetry.lock");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from main.py", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "main.py");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from app.py", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "app.py");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("detects Python from manage.py (Django)", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "manage.py");
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(true);
  });

  it("returns false when package.json exists", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      if (hasFilePath(filePath, "package.json")) return true;
      if (hasFilePath(filePath, "requirements.txt")) return true;
      return false;
    });

    const result = await detectPythonProject("root");
    expect(result).toBe(false);
  });

  it("returns false when no Python files exist", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPythonProject("root");
    expect(result).toBe(false);
  });
});

describe("detectPythonTool", () => {
  it("detects pip from requirements.txt", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "requirements.txt");
    });

    const result = await detectPythonTool("root");
    expect(result).toBe("pip");
  });

  it("detects Poetry from poetry.lock", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "poetry.lock");
    });

    const result = await detectPythonTool("root");
    expect(result).toBe("poetry");
  });

  it("detects Poetry from pyproject.toml with [tool.poetry]", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "pyproject.toml");
    });
    vi.spyOn(utils, "readFile").mockResolvedValue(`
[tool.poetry]
name = "my-project"
version = "0.1.0"
`);

    const result = await detectPythonTool("root");
    expect(result).toBe("poetry");
  });

  it("detects Poetry from pyproject.toml with poetry-core", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "pyproject.toml");
    });
    vi.spyOn(utils, "readFile").mockResolvedValue(`
[build-system]
requires = ["poetry-core"]
`);

    const result = await detectPythonTool("root");
    expect(result).toBe("poetry");
  });

  it("detects Pipenv from Pipfile", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "Pipfile");
    });

    const result = await detectPythonTool("root");
    expect(result).toBe("pipenv");
  });

  it("returns none when no tool files exist", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPythonTool("root");
    expect(result).toBe("none");
  });
});

describe("detectPythonFramework", () => {
  it("detects Django from manage.py", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "manage.py");
    });

    const result = await detectPythonFramework("root", []);
    expect(result).toBe("django");
  });

  it("detects Django from dependencies", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPythonFramework("root", ["django", "requests"]);
    expect(result).toBe("django");
  });

  it("detects Flask from app.py", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      return hasFilePath(filePath, "app.py");
    });

    const result = await detectPythonFramework("root", []);
    expect(result).toBe("flask");
  });

  it("detects Flask from dependencies", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPythonFramework("root", ["flask", "requests"]);
    expect(result).toBe("flask");
  });

  it("returns null when no framework detected", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);

    const result = await detectPythonFramework("root", ["requests", "pytest"]);
    expect(result).toBeNull();
  });
});

describe("parseDependenciesTable", () => {
  it("parses package without version", () => {
    const result = parseDependenciesTable(["requests"]);
    expect(result).toEqual([{ name: "requests", version: "latest" }]);
  });

  it("parses package with == version", () => {
    const result = parseDependenciesTable(["flask==3.0.0"]);
    expect(result).toEqual([{ name: "flask", version: "==3.0.0" }]);
  });

  it("parses package with >= version", () => {
    const result = parseDependenciesTable(["django>=4.2"]);
    expect(result).toEqual([{ name: "django", version: ">=4.2" }]);
  });

  it("parses package with ~= version", () => {
    const result = parseDependenciesTable(["pytest~=8.0"]);
    expect(result).toEqual([{ name: "pytest", version: "~=8.0" }]);
  });

  it("parses multiple packages", () => {
    const result = parseDependenciesTable([
      "requests",
      "flask==3.0.0",
      "django>=4.2",
    ]);
    expect(result).toEqual([
      { name: "requests", version: "latest" },
      { name: "flask", version: "==3.0.0" },
      { name: "django", version: ">=4.2" },
    ]);
  });
});

describe("getPythonCommands", () => {
  it("generates pip commands for regular project", () => {
    const result = getPythonCommands("pip", null, "main.py");
    expect(result.installCommand).toBe("pip install -r requirements.txt");
    expect(result.runCommand).toBe("python main.py");
    expect(result.testCommand).toBe("pytest");
  });

  it("generates pip commands with app.py fallback", () => {
    const result = getPythonCommands("pip", null, "app.py");
    expect(result.runCommand).toBe("python app.py");
  });

  it("generates pip commands with placeholder when no entry file", () => {
    const result = getPythonCommands("pip", null, null);
    expect(result.runCommand).toBe("python your_script.py");
  });

  it("generates Poetry commands", () => {
    const result = getPythonCommands("poetry", null, "main.py");
    expect(result.installCommand).toBe("poetry install");
    expect(result.runCommand).toBe("poetry run python main.py");
    expect(result.testCommand).toBe("poetry run pytest");
  });

  it("generates Pipenv commands", () => {
    const result = getPythonCommands("pipenv", null, "main.py");
    expect(result.installCommand).toBe("pipenv install");
    expect(result.runCommand).toBe("pipenv run python main.py");
    expect(result.testCommand).toBe("pipenv run pytest");
  });

  it("generates Django pip commands", () => {
    const result = getPythonCommands("pip", "django", null);
    expect(result.installCommand).toBe("pip install -r requirements.txt");
    expect(result.runCommand).toBe("python manage.py runserver");
    expect(result.testCommand).toBe("python manage.py test");
  });

  it("generates Django Poetry commands", () => {
    const result = getPythonCommands("poetry", "django", null);
    expect(result.installCommand).toBe("poetry install");
    expect(result.runCommand).toBe("poetry run python manage.py runserver");
    expect(result.testCommand).toBe("poetry run python manage.py test");
  });

  it("generates Django Pipenv commands", () => {
    const result = getPythonCommands("pipenv", "django", null);
    expect(result.installCommand).toBe("pipenv install");
    expect(result.runCommand).toBe("pipenv run python manage.py runserver");
    expect(result.testCommand).toBe("pipenv run python manage.py test");
  });
});
