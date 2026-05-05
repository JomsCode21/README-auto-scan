import { describe, expect, it, vi } from "vitest";
import {
  detectPhpProject,
  detectPhpFramework,
  detectComposer,
  readComposerJson,
  getComposerScripts,
  describeComposerScript,
  getPhpCommands,
  getPhpProjectInfo,
  type ComposerJson,
} from "../src/languages/php";
import * as utils from "../src/utils";

function hasFilePath(filePath: string, fileName: string): boolean {
  const p = filePath.replace(/\\/g, "/");
  const s = fileName.replace(/\\/g, "/");
  return p.endsWith(`/${s}`);
}

describe("detectPhpProject", () => {
  it("detects PHP from composer.json", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "composer.json"),
    );
    const result = await detectPhpProject("root");
    expect(result).toBe(true);
  });

  it("detects PHP from composer.lock", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "composer.lock"),
    );
    const result = await detectPhpProject("root");
    expect(result).toBe(true);
  });

  it("detects PHP from index.php", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "index.php"),
    );
    const result = await detectPhpProject("root");
    expect(result).toBe(true);
  });

  it("detects PHP from phpunit.xml and phpunit.xml.dist", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "phpunit.xml") || hasFilePath(filePath, "phpunit.xml.dist"),
    );
    const result = await detectPhpProject("root");
    expect(result).toBe(true);
  });
});

describe("detectPhpFramework", () => {
  it("detects Laravel from artisan file", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "artisan"),
    );
    const result = await detectPhpFramework("root", null);
    expect(result).toBe("laravel");
  });

  it("detects Laravel from composer.json require", async () => {
    vi.spyOn(utils, "fileExists").mockResolvedValue(false);
    const composer: ComposerJson = { require: { "laravel/framework": "^11.0" } };
    const result = await detectPhpFramework("root", composer);
    expect(result).toBe("laravel");
  });

  it("detects Laravel from routes/web.php or bootstrap/app.php or app/Http", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "routes/web.php") ||
      hasFilePath(filePath, "routes/api.php") ||
      hasFilePath(filePath, "bootstrap/app.php") ||
      hasFilePath(filePath, "app/Http"),
    );
    const result = await detectPhpFramework("root", null);
    expect(result).toBe("laravel");
  });
});

describe("detectComposer", () => {
  it("detects composer when composer.json exists", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "composer.json"),
    );
    const result = await detectComposer("root");
    expect(result).toBe("composer");
  });

  it("detects composer when composer.lock exists", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "composer.lock"),
    );
    const result = await detectComposer("root");
    expect(result).toBe("composer");
  });
});

describe("composer scripts", () => {
  it("describes common composer scripts", () => {
    expect(describeComposerScript("test")).toBe("Run tests");
    expect(describeComposerScript("format")).toBe("Format code");
    expect(describeComposerScript("analyse")).toBe("Run static analysis");
    expect(describeComposerScript("analyze")).toBe("Run static analysis");
    expect(describeComposerScript("stan")).toBe("Run PHPStan analysis");
    expect(describeComposerScript("pint")).toBe("Run Laravel Pint formatter");
    expect(describeComposerScript("fix")).toBe("Fix code style issues");
    expect(describeComposerScript("serve")).toBe("Start local development server");
    expect(describeComposerScript("start")).toBe("Start the app");
    expect(describeComposerScript("custom")).toBe("Run the custom script");
  });

  it("reads composer.json scripts into table", async () => {
    const composer: ComposerJson = {
      scripts: {
        test: "phpunit",
        format: "pint",
        analyse: "phpstan analyse",
      },
    };
    const result = getComposerScripts(composer);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ name: "test", command: "phpunit", description: "Run tests" });
  });
});

describe("PHP commands generation", () => {
  it("generates Laravel commands", async () => {
    const result = await getPhpCommands("laravel", false, true);
    expect(result.installCommand).toBe("composer install");
    expect(result.runCommand).toBe("php artisan serve");
    expect(result.testCommand).toBe("php artisan test");
  });

  it("generates basic PHP commands with index.php", async () => {
    const result = await getPhpCommands(null, true, true);
    expect(result.runCommand).toBe("php index.php");
    expect(result.testCommand).toBe("vendor/bin/phpunit");
  });

  it("generates basic PHP commands with fallback script", async () => {
    const result = await getPhpCommands(null, false, false);
    expect(result.runCommand).toBe("php your-script.php");
    expect(result.testCommand).toBe("# Add your test command here");
  });
});

describe("getPhpProjectInfo", () => {
  it("parses composer.json for name, description, license, deps, scripts", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) => {
      if (hasFilePath(filePath, "composer.json")) return true;
      if (hasFilePath(filePath, "index.php")) return true;
      if (hasFilePath(filePath, "phpunit.xml")) return true;
      if (hasFilePath(filePath, "artisan")) return false;
      return false;
    });
    vi.spyOn(utils, "readJsonFile").mockResolvedValue({
      name: "example/php-basic",
      description: "Example basic PHP project for README Auto Scan.",
      license: "MIT",
      require: { php: "^8.2", "guzzlehttp/guzzle": "^7.0" },
      "require-dev": { "phpunit/phpunit": "^11.0" },
      scripts: { test: "phpunit" },
    } as ComposerJson);

    const info = await getPhpProjectInfo("root");
    expect(info.language).toBe("PHP");
    expect(info.projectName).toBe("example/php-basic");
    expect(info.description).toContain("Example basic PHP project");
    expect(info.license).toBe("MIT");
    expect(info.dependencies["guzzlehttp/guzzle"]).toBe("^7.0");
    expect(info.devDependencies["phpunit/phpunit"]).toBe("^11.0");
    expect(info.composerScripts.length).toBe(1);
  });

  it("detects Laravel from artisan even if package.json exists", async () => {
    vi.spyOn(utils, "fileExists").mockImplementation(async (filePath: string) =>
      hasFilePath(filePath, "artisan"),
    );
    const info = await getPhpProjectInfo("root");
    expect(info.framework).toBe("laravel");
    expect(info.runCommand).toBe("php artisan serve");
  });
});
