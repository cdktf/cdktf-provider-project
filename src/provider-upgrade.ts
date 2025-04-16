/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { javascript } from "projen";
import { JobPermission, JobStep } from "projen/lib/github/workflows-model";
import { generateRandomCron } from "./util/random-cron";

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
      schedule: [
        {
          cron: generateRandomCron({
            project,
            maxHour: 0,
            hourOffset: 3,
          }),
        },
      ], // Run every day sometime between 3 and 4am
      workflowDispatch: {}, // allow manual triggering
    });

    const newerVersionAvailable =
      "${{ steps.check_version.outputs.new_version == 'available' }}";
    const currentVersion = "${{ steps.current_version.outputs.value }}";
    const newVersion = "${{ steps.new_version.outputs.value }}";
    const semanticType = "${{ steps.release.outputs.type }}";

    const steps: JobStep[] = [
      {
        name: "Checkout",
        uses: "actions/checkout",
      },
      {
        name: "Setup Terraform",
        uses: "hashicorp/setup-terraform",
        with: {
          terraform_wrapper: false,
        },
      },
      {
        name: "Setup Node.js",
        uses: "actions/setup-node",
        with: {
          "node-version": project.minNodeVersion,
        },
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
          `CURRENT_VERSION_MINOR=$(cut -d "." -f 2 <<< "$CURRENT_VERSION")`,
          `NEW_VERSION_MINOR=$(cut -d "." -f 2 <<< "$NEW_VERSION")`,
          `[[ "$CURRENT_VERSION_MINOR" != "$NEW_VERSION_MINOR" ]] && IS_MINOR_RELEASE=true || IS_MINOR_RELEASE=false`,
          `[[ "$IS_MINOR_RELEASE" == "true" ]] && SEMANTIC_TYPE=feat || SEMANTIC_TYPE=fix`,
          `echo "is_minor=$IS_MINOR_RELEASE" >> $GITHUB_OUTPUT`,
          `echo "type=$SEMANTIC_TYPE" >> $GITHUB_OUTPUT`,
        ].join("\n"),
      },
      // submit a PR
      {
        name: "Create Pull Request",
        if: newerVersionAvailable,
        uses: "peter-evans/create-pull-request",
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
    ];

    workflow.addJobs({
      upgrade: {
        runsOn: options.workflowRunsOn,
        env: {
          NODE_OPTIONS: `--max-old-space-size=${options.nodeHeapSize}`,
        },
        steps,
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
