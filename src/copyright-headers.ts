import { cdk, TextFile } from "projen";

export class CopyrightHeaders {
  constructor(project: cdk.JsiiProject) {
    // Run copywrite tool to add copyright headers to all files
    // This runs on individual repositories that use this Projen template
    project.buildWorkflow?.addPostBuildSteps(
      {
        name: "Setup Copywrite tool",
        uses: "hashicorp/setup-copywrite@3ace06ad72e6ec679ea8572457b17dbc3960b8ce", // v1.0.0
        with: { token: "${{ secrets.GITHUB_TOKEN }}" },
      },
      { name: "Add headers using Copywrite tool", run: "copywrite headers" }
    );

    // copywrite config for the individual pre-built providers
    new TextFile(project, ".copywrite.hcl", {
      lines: `schema_version = 1

project {
  license        = "MPL-2.0"
  copyright_year = 2021

  # (OPTIONAL) A list of globs that should not have copyright/license headers.
  # Supports doublestar glob patterns for more flexibility in defining which
  # files or folders should be ignored
  header_ignore = [
    # "vendors/**",
    # "**autogen**",
    "**/node_modules/**",
    "lib/**",
    "dist/**",
    "logs/**",
    "build/**",
    ".gen/**",
    ".github/ISSUE_TEMPLATE/**",
    ".terraform/**",
    "docs/**",
    "API.md",
  ]
}
`.split("\n"),
    });
  }
}
