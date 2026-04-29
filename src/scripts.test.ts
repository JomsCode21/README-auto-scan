import { describe, expect, it } from "vitest";
import { explainScripts } from "./scripts";

describe("explainScripts", () => {
  it("should describe common scripts correctly", () => {
    const scripts = {
      dev: "vite",
      build: "tsc && vite build",
      test: "vitest",
      lint: "eslint .",
      format: "prettier --write .",
    };

    const result = explainScripts(scripts);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      name: "dev",
      command: "vite",
      description: "Start development server",
    });
    expect(result[1]).toEqual({
      name: "build",
      command: "tsc && vite build",
      description: "Build for production",
    });
    expect(result[2]).toEqual({
      name: "test",
      command: "vitest",
      description: "Run test suite",
    });
  });

  it("should infer descriptions from command patterns", () => {
    const scripts = {
      "test:watch": "jest --watch",
      "test:coverage": "vitest --coverage",
      "lint:fix": "eslint . --fix",
      "typecheck": "tsc --noEmit",
      "clean": "rimraf dist",
    };

    const result = explainScripts(scripts);

    expect(result.find((r) => r.name === "test:watch")?.description).toBe(
      "Run tests in watch mode"
    );
    expect(result.find((r) => r.name === "test:coverage")?.description).toBe(
      "Run tests with coverage"
    );
    expect(result.find((r) => r.name === "lint:fix")?.description).toBe(
      "Fix linting issues automatically"
    );
    expect(result.find((r) => r.name === "typecheck")?.description).toBe(
      "Check TypeScript types"
    );
  });

  it("should handle empty scripts object", () => {
    const result = explainScripts({});
    expect(result).toHaveLength(0);
  });

  it("should fallback to generic description for unknown scripts", () => {
    const scripts = {
      custom: "do something special",
      foo: "bar",
    };

    const result = explainScripts(scripts);

    expect(result[0].description).toBe("Run the custom script");
    expect(result[1].description).toBe("Run the foo script");
  });

  it("should handle prefixed scripts", () => {
    const scripts = {
      "lint:src": "eslint src/",
      "lint:test": "eslint test/",
      "build:client": "vite build --config vite.client.config.ts",
      "build:server": "vite build --config vite.server.config.ts",
    };

    const result = explainScripts(scripts);

    expect(result.find((r) => r.name === "lint:src")?.description).toBe(
      "Run src linting"
    );
    expect(result.find((r) => r.name === "build:client")?.description).toBe(
      "Build client target"
    );
  });
});
