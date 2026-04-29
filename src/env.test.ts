import { describe, expect, it } from "vitest";
import { parseEnvExample } from "./env";

describe("parseEnvExample", () => {
  it("should parse variables from .env.example content", async () => {
    const content = `
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=your_api_key_here
NODE_ENV=development
`;

    // Create a temporary file path for testing
    const fs = await import("fs/promises");
    const os = await import("os");
    const path = await import("path");

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "env-test-"));
    const tempFile = path.join(tempDir, ".env.example");
    await fs.writeFile(tempFile, content);

    const result = await parseEnvExample(tempFile);

    expect(result).toContain("DATABASE_URL");
    expect(result).toContain("API_KEY");
    expect(result).toContain("NODE_ENV");
    expect(result).toHaveLength(3);

    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
  });

  it("should ignore comments and blank lines", async () => {
    const content = `
# Database configuration
DATABASE_URL=

# API Keys
API_KEY=
SECRET_TOKEN=

# This is a comment
NODE_ENV=
`;

    const fs = await import("fs/promises");
    const os = await import("os");
    const path = await import("path");

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "env-test-"));
    const tempFile = path.join(tempDir, ".env.example");
    await fs.writeFile(tempFile, content);

    const result = await parseEnvExample(tempFile);

    expect(result).toContain("DATABASE_URL");
    expect(result).toContain("API_KEY");
    expect(result).toContain("SECRET_TOKEN");
    expect(result).toContain("NODE_ENV");
    expect(result).not.toContain("# Database");
    expect(result).not.toContain("# API");
    expect(result).toHaveLength(4);

    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
  });

  it("should handle variables without values", async () => {
    const content = `
EMPTY_VAR=
VAR_WITH_VALUE=something
ANOTHER_EMPTY=
`;

    const fs = await import("fs/promises");
    const os = await import("os");
    const path = await import("path");

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "env-test-"));
    const tempFile = path.join(tempDir, ".env.example");
    await fs.writeFile(tempFile, content);

    const result = await parseEnvExample(tempFile);

    expect(result).toContain("EMPTY_VAR");
    expect(result).toContain("VAR_WITH_VALUE");
    expect(result).toContain("ANOTHER_EMPTY");

    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
  });

  it("should return empty array for empty file", async () => {
    const fs = await import("fs/promises");
    const os = await import("os");
    const path = await import("path");

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "env-test-"));
    const tempFile = path.join(tempDir, ".env.example");
    await fs.writeFile(tempFile, "\n\n# only comments\n");

    const result = await parseEnvExample(tempFile);

    expect(result).toHaveLength(0);

    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
  });
});
