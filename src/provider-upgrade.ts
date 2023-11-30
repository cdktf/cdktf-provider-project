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
    const semanticType = "${{ steps.release.outputs.type }}";

    workflow.addJobs({
      upgrade: {
        runsOn: options.workflowRunsOn,
        env: {
          NODE_OPTIONS: `--max-old-space-size=${options.nodeHeapSize}`,
        },
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
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
          {
            name: "Determine if this is a minor or patch release",
            if: newerVersionAvailable,
            id: "release",
            env: {
              CURRENT_VERSION: currentVersion,
              NEW_VERSION: newVersion,
            },
            run: [
              `CURRENT_VERSION_MINOR=$(cut -d "." -f 1 <<< "$CURRENT_VERSION")`,
              `NEW_VERSION_MINOR=$(cut -d "." -f 1 <<< "$NEW_VERSION")`,
              `[[ "$CURRENT_VERSION_MINOR" != "$NEW_VERSION_MINOR" ]] && IS_MINOR_RELEASE=true || IS_MINOR_RELEASE=false`,
              `[[ "$IS_MINOR_RELEASE" == "true" ]] && SEMANTIC_TYPE=feat || SEMANTIC_TYPE=fix`,
              `echo "is_minor=$IS_MINOR_RELEASE" >> $GITHUB_OUTPUT`,
              `echo "type=$SEMANTIC_TYPE" >> $GITHUB_OUTPUT`,
            ].join("\n"),
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
              branch: "auto/provider-upgrade",
              "commit-message": `${semanticType}: upgrade provider from \`${currentVersion}\` to version \`${newVersion}\``,
              title: `${semanticType}: upgrade provider from \`${currentVersion}\` to version \`${newVersion}\``,
              body: `This PR upgrades the underlying Terraform provider to version ${newVersion}`,
              labels: "automerge,auto-approve",
              token: "${{ secrets.GH_TOKEN }}",
              "delete-branch": true,
              committer: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              author: "Team Terraform CDK <github-team-tf-cdk@hashicorp.com>",
              signoff: true,
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
