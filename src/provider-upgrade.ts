/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { javascript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";

interface ProviderUpgradeOptions {
  checkForUpgradesScriptPath: string;
  workflowRunsOn: string[];
  nodeHeapSize: string;
}
/**
 * Checks for new versions of the given provider and creates a PR with an upgrade change if there are changes.
 */
export class ProviderUpgrade {
  constructor(
    project: javascript.NodeProject,
    options: ProviderUpgradeOptions
  ) {
    project.addTask("check-if-new-provider-version", {
      exec: `node ./${options.checkForUpgradesScriptPath}`,
    });

    const workflow = project.github?.addWorkflow("provider-upgrade");

    if (!workflow) throw new Error("no workflow defined");

    workflow.on({
      schedule: [{ cron: "0 3 * * *" }], // Run every day at 3 O'Clock
      workflowDispatch: {}, // allow manual triggering
    });

    const newerVersionAvailable =
      "${{ steps.check_version.outputs.new_version == 'available' }}";
    const currentVersion = "${{ steps.current_version.outputs.value }}";
    const newVersion = "${{ steps.new_version.outputs.value }}";

    workflow.addJobs({
      upgrade: {
        runsOn: options.workflowRunsOn,
        environment: {
          NODE_OPTIONS: `--max-old-space-size=${options.nodeHeapSize}`,
        },
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v2",
          },
          { run: "yarn install" },
          {
            id: "check_version",
            run: "yarn check-if-new-provider-version",
          },
          {
            name: "get provider current version",
            if: newerVersionAvailable,
            id: "current_version",
            run: `echo "value=$(jq -r '.cdktf.provider.version' package.json)" >> $GITHUB_OUTPUT`,
          },
          {
            run: "yarn fetch",
            if: newerVersionAvailable,
            env: {
              CHECKPOINT_DISABLE: "1",
              GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
            },
          },
          {
            name: "get provider updated version",
            if: newerVersionAvailable,
            id: "new_version",
            run: `echo "value=$(jq -r '. | to_entries[] | .value' src/version.json)" >> $GITHUB_OUTPUT`,
          },
          // generate docs
          { run: "yarn compile", if: newerVersionAvailable },
          { run: "yarn docgen", if: newerVersionAvailable },

          // submit a PR
          {
            name: "Create Pull Request",
            if: newerVersionAvailable,
            uses: "peter-evans/create-pull-request@v3",
            with: {
              "commit-message": `chore: upgrade provider from \`${currentVersion}\` to version \`${newVersion}\``,
              branch: "auto/provider-upgrade",
              title: `chore: upgrade provider from \`${currentVersion}\` to version \`${newVersion}\``,
              body: `This PR upgrades provider to version ${newVersion}`,
              labels: "automerge",
              token: "${{ secrets.GH_TOKEN }}",
              "delete-branch": true,
              committer: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              author: "Team Terraform CDK <github-team-tf-cdk@hashicorp.com>",
            },
          },
        ],
        permissions: {
          pullRequests: JobPermission.WRITE,
          issues: JobPermission.WRITE,
          contents: JobPermission.WRITE,
          statuses: JobPermission.WRITE,
        },
      },
    });
  }
}
