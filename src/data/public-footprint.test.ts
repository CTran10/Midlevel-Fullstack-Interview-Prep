import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const forbiddenCompanyNames = [
  ["Fare", "Harbor"].join(""),
  ["fare", "harbor"].join(""),
  ["Door", "Dash"].join(""),
  ["door", "dash"].join("")
];

const publicPaths = [
  "README.md",
  "package.json",
  "full_stack_interview_flashcards.md",
  "app",
  "src"
];

const ignoredDirectories = new Set([".next", "coverage", "dist", "node_modules", "out"]);

function collectFiles(path: string): string[] {
  const fullPath = join(process.cwd(), path);
  const stats = statSync(fullPath);

  if (stats.isFile()) {
    return [fullPath];
  }

  return readdirSync(fullPath).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) {
      return [];
    }

    return collectFiles(join(path, entry));
  });
}

describe("public repository footprint", () => {
  it("does not expose company-specific interview target names", () => {
    const matches = publicPaths
      .flatMap(collectFiles)
      .flatMap((filePath) => {
        const text = readFileSync(filePath, "utf8");

        return forbiddenCompanyNames
          .filter((companyName) => text.includes(companyName))
          .map((companyName) => `${filePath.replace(`${process.cwd()}/`, "")}: ${companyName}`);
      });

    expect(matches).toEqual([]);
  });
});
