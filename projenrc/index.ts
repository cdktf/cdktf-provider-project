/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { typescript } from "projen";
import { UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { UpgradeNode } from "./upgrade-node";
import { AutoApprove } from "../src/auto-approve";
import { Automerge } from "../src/automerge";
import { CustomizedLicense } from "../src/customized-license";
import { LockIssues } from "../src/lock-issues";
import { generateRandomCron, Schedule } from "../src/util/random-cron";

export class ParentProviderProject extends typescript.TypeScriptProject {
  constructor(options: Partial<typescript.TypeScriptProjectOptions>) {
    super({
      name: "@cdktf/provider-project",
      authorName: "HashiCorp",
      authorUrl: "https://hashicorp.com",
      repository: "https://github.com/cdktf/cdktf-provider-project.git",
      authorOrganization: true,
      licensed: false, // we do supply our own license file with a custom header
      pullRequestTemplate: false,
      defaultReleaseBranch: "main",
      releaseToNpm: true,
      mergify: false,
      prettier: true,
      scripts: {
        "eslint:fix": "eslint . --ext .ts --fix",
      },
      stale: false, // disabling for now but keeping the options below so we can turn it back on if desired
      staleOptions: {
        issues: {
          exemptLabels: ["backlog", "help wanted", "no-auto-close"],
          staleLabel: "stale",
          daysBeforeStale: 30,
          staleMessage:
            "Hi there! 👋 We haven't heard from you in 30 days and would like to know if the problem has been resolved or if " +
            "you still need help. If we don't hear from you before then, I'll auto-close this issue in 30 days.",
          daysBeforeClose: 30,
          closeMessage:
            "I'm closing this issue because we haven't heard back in 60 days. ⌛️ If you still need help, feel free to reopen the issue!",
        },
        pullRequest: {
          exemptLabels: ["backlog", "help wanted", "no-auto-close"],
          staleLabel: "stale",
          daysBeforeStale: 60,
          staleMessage:
            "Hi there! 👋 We haven't heard from you in 60 days and would like to know if you're still working on this or need help. " +
            "If we don't hear from you before then, I'll auto-close this PR in 30 days.",
          daysBeforeClose: 30,
          closeMessage:
            "I'm closing this pull request because we haven't heard back in 90 days. ⌛️ If you're still working on this, feel free to reopen the PR or create a new one!",
        },
      },
      workflowGitIdentity: {
        name: "team-tf-cdk",
        email: "github-team-tf-cdk@hashicorp.com",
      },
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ["automerge", "auto-approve", "dependencies"],
          schedule: UpgradeDependenciesSchedule.WEEKLY,
        },
      },
      peerDeps: ["projen@^0.79.3", "constructs@^10.3.0"],
      deps: ["change-case", "fs-extra"],
      devDeps: ["@types/fs-extra", "glob"],
      bundledDeps: ["change-case", "fs-extra"],
      projenrcTs: true,
      ...options,
    });

    this.addFields({ publishConfig: { access: "public" } });

    new CustomizedLicense(this, 2020);
    new LockIssues(this);
    new AutoApprove(this);
    new Automerge(this);
    new UpgradeNode(this);

    this.addPackageIgnore("projenrc");
    this.addPackageIgnore("/.projenrc.ts");
    this.addPackageIgnore(".copywrite.hcl");

    // Make sure 'chore' tasks also show up in the changelog
    // Changes in this repo can be quite consequential, so don't hide chores
    this.addFields({
      "standard-version": {
        types: [
          {
            type: "feat",
            section: "Features",
          },
          {
            type: "fix",
            section: "Bug Fixes",
          },
          {
            type: "chore",
            section: "Updates",
          },
          {
            type: "docs",
            hidden: true,
          },
          {
            type: "style",
            hidden: true,
          },
          {
            type: "refactor",
            hidden: true,
          },
          {
            type: "perf",
            hidden: true,
          },
          {
            type: "test",
            hidden: true,
          },
        ],
      },
    });

    // Run copywrite tool to add copyright headers to all files
    // This is for this repository itself, not for the projects
    // using this Projen template
    this.buildWorkflow?.addPostBuildSteps(
      {
        name: "Setup Copywrite tool",
        uses: "hashicorp/setup-copywrite@867a1a2a064a0626db322392806428f7dc59cb3e", // v1.1.2
      },
      { name: "Add headers using Copywrite tool", run: "copywrite headers" }
    );

    const staleWorkflow = this.tryFindObjectFile(".github/workflows/stale.yml");
    staleWorkflow?.addOverride("on.schedule", [
      {
        cron: generateRandomCron({ project: this, maxHour: 4, hourOffset: 1 }),
      },
    ]);

    const upgradeWorkflow = this.tryFindObjectFile(
      ".github/workflows/upgrade-main.yml"
    );
    upgradeWorkflow?.addOverride("on.schedule", [
      {
        cron: generateRandomCron({
          project: this,
          maxHour: 0,
          schedule: Schedule.Weekly,
        }),
      },
    ]);

    const releaseWorkflow = this.tryFindObjectFile(
      ".github/workflows/release.yml"
    );
    releaseWorkflow?.addOverride("on.push", {
      branches: ["main"],
      "paths-ignore": [
        // don't do a release if the change was only to these files/directories
        ".github/ISSUE_TEMPLATE/**",
        ".github/CODEOWNERS",
        ".github/dependabot.yml",
        ".github/**/*.md",
      ],
    });
  }
}
