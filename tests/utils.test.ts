import { describe, expect, it } from "vitest";
import { normalizeAuthor, toArray, toPosixPath } from "../src/utils";

describe("toArray", () => {
  it("should return empty array for undefined", () => {
    expect(toArray(undefined)).toEqual([]);
  });

  it("should return the same array if already an array", () => {
    const arr = ["a", "b", "c"];
    expect(toArray(arr)).toEqual(arr);
  });

  it("should wrap string in array", () => {
    expect(toArray("single")).toEqual(["single"]);
  });

  it("should extract keys from object", () => {
    const obj = { a: "1", b: "2", c: "3" };
    expect(toArray(obj)).toEqual(["a", "b", "c"]);
  });
});

describe("normalizeAuthor", () => {
  it("should return empty string for undefined", () => {
    expect(normalizeAuthor(undefined)).toBe("");
  });

  it("should return string as-is", () => {
    expect(normalizeAuthor("John Doe")).toBe("John Doe");
  });

  it("should extract name from author object", () => {
    expect(normalizeAuthor({ name: "Jane Doe" })).toBe("Jane Doe");
  });

  it("should return empty string for author object without name", () => {
    expect(normalizeAuthor({})).toBe("");
  });
});

describe("toPosixPath", () => {
  it("should convert Windows paths to POSIX", () => {
    // Note: This test assumes Windows path separator
    const path = require("path");
    if (path.sep === "\\") {
      expect(toPosixPath("src\\utils\\file.ts")).toBe("src/utils/file.ts");
    } else {
      // On POSIX systems, path shouldn't change
      expect(toPosixPath("src/utils/file.ts")).toBe("src/utils/file.ts");
    }
  });

  it("should handle already POSIX paths", () => {
    expect(toPosixPath("src/utils/file.ts")).toBe("src/utils/file.ts");
  });
});
