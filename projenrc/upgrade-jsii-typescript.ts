/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { javascript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";
import { generateRandomCron } from "../src/util/random-cron";

/**
 * Helper script for upgrading JSII and TypeScript in the right way.
 * This currently isn't automated (the workflow must be manually run)
 * because there is no way to programmatically determine the EOL date
 * of a JSII version range. This can be found at:
 * https://github.com/aws/jsii-compiler/blob/main/README.md#gear-maintenance--support
 */
export class UpgradeJSIIAndTypeScript {
  constructor(project: javascript.NodeProject, typescriptVersion: string) {
    const workflow = project.github?.addWorkflow("upgrade-jsii-typescript");
    if (!workflow) throw new Error("no workflow defined");

    const plainVersion = typescriptVersion.replace("~", "");
    workflow.on({
      // run daily sometime between midnight and 6am UTC
      schedule: [
        { cron: generateRandomCron({ project, maxHour: 3, hourOffset: 1 }) },
      ],
      workflowDispatch: {
        inputs: {
          newVersion: {
            description: `New JSII/TypeScript version (e.g. "${plainVersion}"), without carets or tildes`,
            required: false,
            type: "string",
          },
        },
      },
    });

    (workflow.concurrency as any) = {
      group: "${{ github.workflow }}-${{ github.ref }}",
    };

    workflow.addJobs({
      version: {
        name: "Determine version to upgrade to",
        runsOn: ["ubuntu-latest"],
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v3",
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v3",
            with: {
              "node-version": project.minNodeVersion,
            },
          },
          {
            name: "Install",
            run: "yarn install",
          },
          {
            name: "Get current JSII version",
            run: [
              `CURRENT_VERSION=$(npm list jsii --depth=0 --json | jq -r '.dependencies.jsii.version')`,
              `CURRENT_VERSION_SHORT=$(cut -d "." -f 1,2 <<< "$CURRENT_VERSION")`,
              `CURRENT_VERSION_MAJOR=$(cut -d "." -f 1 <<< "$CURRENT_VERSION")`,
              `CURRENT_VERSION_MINOR=$(cut -d "." -f 2 <<< "$CURRENT_VERSION")`,
              `echo "CURRENT_JSII_VERSION=$CURRENT_VERSION" >> $GITHUB_ENV`,
              `echo "CURRENT_JSII_VERSION_SHORT=$CURRENT_VERSION_SHORT" >> $GITHUB_ENV`,
              `echo "CURRENT_JSII_VERSION_MAJOR=$CURRENT_VERSION_MAJOR" >> $GITHUB_ENV`,
              `echo "CURRENT_JSII_VERSION_MINOR=$CURRENT_VERSION_MINOR" >> $GITHUB_ENV`,
            ].join("\n"),
          },
          {
            name: "Get the earliest supported JSII version whose EOS date is at least a month away",
            if: "${{ ! inputs.new_version }}", // should be newVersion but Projen converts it to snake_case
            uses: "actions/github-script@v6",
            with: {
              script: [
                `const script = require('./projenrc/scripts/check-jsii-versions.js')`,
                `await script({github, context, core})`,
              ].join("\n"),
            },
          },
          {
            // In an ideal world this is where we'd validate that the manually-input version actually exists
            // In practice, I couldn't figure out how to do this properly and it wasn't worth the effort
            // name: "Check if the manually-input version actually exists (has been published to NPM)",
            name: "Save the manually-input version to environment variables for comparison",
            if: "${{ inputs.new_version }}", // should be newVersion but Projen converts it to snake_case
            env: {
              NEW_VERSION: "${{ inputs.new_version }}",
            },
            run: [
              // My command line skillz aren't good enough to figure out how to make the below work (error if the version doesn't exist)
              // `yarn info jsii versions --json | jq -e 'select(.data | index("$NEW_VERSION"))`,
              `NEW_VERSION_SHORT=$(cut -d "." -f 1,2 <<< "$NEW_VERSION")`,
              `NEW_VERSION_MAJOR=$(cut -d "." -f 1 <<< "$NEW_VERSION")`,
              `NEW_VERSION_MINOR=$(cut -d "." -f 2 <<< "$NEW_VERSION")`,
              `echo "NEW_JSII_VERSION=$NEW_VERSION" >> $GITHUB_ENV`,
              `echo "NEW_JSII_VERSION_SHORT=$NEW_VERSION_SHORT" >> $GITHUB_ENV`,
              `echo "NEW_JSII_VERSION_MAJOR=$NEW_VERSION_MAJOR" >> $GITHUB_ENV`,
              `echo "NEW_JSII_VERSION_MINOR=$NEW_VERSION_MINOR" >> $GITHUB_ENV`,
            ].join("\n"),
          },
          {
            name: "Cancel the rest of the run if the desired version isn't newer than what we have installed already",
            if: "${{ !((env.NEW_JSII_VERSION_MAJOR > env.CURRENT_JSII_VERSION_MAJOR) || (env.NEW_JSII_VERSION_MINOR > env.CURRENT_JSII_VERSION_MINOR)) }}",
            env: {
              GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
              RUN_ID: "${{ github.run_id }}",
            },
            run: "gh run cancel $RUN_ID \ngh run watch $RUN_ID",
          },
          {
            name: "Output env variables for use in the next job",
            id: "latest_version",
            run: [
              `echo "value=$NEW_JSII_VERSION" >> $GITHUB_OUTPUT`,
              `echo "short=$NEW_JSII_VERSION_SHORT" >> $GITHUB_OUTPUT`,
            ].join("\n"),
          },
        ],
        outputs: {
          value: {
            stepId: "latest_version",
            outputName: "value",
          },
          short: {
            stepId: "latest_version",
            outputName: "short",
          },
        },
        permissions: {
          contents: JobPermission.READ,
          actions: JobPermission.WRITE,
        },
      },
      upgrade: {
        name: "Upgrade JSII & TypeScript",
        runsOn: ["ubuntu-latest"],
        needs: ["version"],
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v3",
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v3",
            with: {
              "node-version": project.minNodeVersion,
            },
          },
          {
            name: "Install",
            run: "yarn install",
          },
          {
            name: "Run upgrade script",
            run: "projenrc/scripts/update-jsii-typescript.sh ${{ needs.version.outputs.value }}",
          },
          {
            name: "Create Pull Request",
            uses: "peter-evans/create-pull-request@v3",
            with: {
              branch: "auto/upgrade-jsii-ts-${{ needs.version.outputs.short }}",
              base: "main",
              "commit-message":
                "chore: upgrade jsii & typescript to v${{ needs.version.outputs.short }}",
              title:
                "chore: upgrade jsii & typescript to v${{ needs.version.outputs.short }}",
              body: [
                "This PR increases the version of JSII and TypeScript to `~${{ needs.version.outputs.value }}` ",
                "because the previous version is close to EOL or no longer supported. Support timeline: ",
                "https://github.com/aws/jsii-compiler/blob/main/README.md#gear-maintenance--support",
              ].join(" "),
              labels: "auto-approve,automerge,automated",
              token: "${{ secrets.PROJEN_GITHUB_TOKEN }}",
              author: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              committer: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              signoff: true,
              "delete-branch": true,
            },
          },
        ],
        env: {
          CI: "true",
          CHECKPOINT_DISABLE: "1",
        },
        permissions: {
          contents: JobPermission.READ,
        },
      },
    });
  }
}
