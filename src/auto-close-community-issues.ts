/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { javascript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";

interface AutoCloseCommunityIssuesOptions {
  providerName: string;
}
/**
 * Automatically closes issues and PRs by non-collaborators since this isn't the right place for them.
 */
export class AutoCloseCommunityIssues {
  constructor(
    project: javascript.NodeProject,
    options: AutoCloseCommunityIssuesOptions
  ) {
    const { providerName } = options;
    const issueWorkflow = project.github?.addWorkflow(
      "auto-close-community-issues"
    );
    const prWorkflow = project.github?.addWorkflow("auto-close-community-prs");

    if (!issueWorkflow) throw new Error("no workflow defined");
    if (!prWorkflow) throw new Error("no workflow defined");

    issueWorkflow.on({
      issues: {
        types: ["opened"],
      },
    });
    prWorkflow.on({
      pullRequest: {
        types: ["opened"],
      },
    });

    const maintainerStatuses = `fromJSON('["OWNER", "MEMBER", "COLLABORATOR", "CONTRIBUTOR"]')`;
    const comment =
      `Hi there! 👋 We appreciate your interest, but this is probably not the right place. 
      All the code in this repository is auto-generated using 
      [cdktf-provider-project](https://github.com/cdktf/cdktf-provider-project) and 
      [cdktf-repository-manager](https://github.com/cdktf/cdktf-repository-manager) from the source 
      [Terraform provider](https://github.com/terraform-providers/terraform-provider-${providerName}). 
      If there are problems, they should be addressed in one of those 3 repositories, not here, 
      as any changes here will just get overwritten the next time there is an update upstream. 
      Please open a new issue or PR in one of those repos. In the meantime, I'll auto-close this. 
      Thanks!`.replace(/\s+/g, " ");

    issueWorkflow.addJob("autoclose", {
      runsOn: ["ubuntu-latest"],
      permissions: {
        issues: JobPermission.WRITE,
      },
      if: `github.event.issue.user.login == 'team-tf-cdk' || contains(${maintainerStatuses}, github.event.issue.author_association)`,
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "Auto-close issues by non-collaborators",
          env: {
            GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run:
            'gh issue close ${{ github.event.issue.number }} --reason "not planned" --comment "' +
            comment +
            '"',
        },
        {
          name: "Add labels",
          env: {
            GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: 'gh issue edit ${{ github.event.issue.number }} --add-label "invalid,wontfix"',
        },
      ],
    });

    prWorkflow.addJob("autoclose", {
      runsOn: ["ubuntu-latest"],
      permissions: {
        pullRequests: JobPermission.WRITE,
      },
      if: `github.event.pull_request.user.login == 'team-tf-cdk' || contains(${maintainerStatuses}, github.event.pull_request.author_association)`,
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "Auto-close PRs by non-collaborators",
          env: {
            GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run:
            'gh pr close ${{ github.event.pull_request.number }} --delete-branch --comment "' +
            comment +
            '"',
        },
        {
          name: "Add labels",
          env: {
            GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: 'gh pr edit ${{ github.event.pull_request.number }} --add-label "invalid,wontfix"',
        },
      ],
    });
  }
}
