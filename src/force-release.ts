/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";

interface ForceReleaseOptions {
  workflowRunsOn: string[];
  repositoryUrl: string;
}

export class ForceRelease {
  constructor(project: cdk.JsiiProject, options: ForceReleaseOptions) {
    const { workflowRunsOn } = options;
    const workflow = new GithubWorkflow(project.github!, "force-release");
    workflow.on({
      workflowDispatch: {
        inputs: {
          sha: {
            name: "sha",
            type: "string",
            required: true,
            description: "The sha of the commit to release",
          },
          publish_to_go: {
            name: "publish_to_go",
            type: "boolean",
            required: true,
            description: "Whether to publish to Go Repository",
          },
        },
      },
    });

    workflow.addJob("force-release", {
      runsOn: workflowRunsOn,
      permissions: {
        contents: JobPermission.WRITE,
      },
      env: {
        CI: "true",
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout",
          with: {
            ref: "${{ inputs.sha }}",
            "fetch-depth": 0,
          },
        },
        {
          name: "Set git config safe.directory",
          run: "git config --global --add safe.directory $(pwd)",
        },
        {
          name: "Set git identity",
          run: 'git config user.name "github-actions"\ngit config user.email "github-actions@github.com"',
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node",
          with: {
            "node-version": project.minNodeVersion,
          },
        },
        {
          name: "Install dependencies",
          run: "yarn install --check-files --frozen-lockfile",
        },
        { name: "build", run: "npx projen build" },
        {
          name: "Backup artifact permissions",
          run: "cd dist && getfacl -R . > permissions-backup.acl",
          continueOnError: true,
        },
        {
          name: "Upload artifact",
          uses: "actions/upload-artifact",
          with: { name: "build-artifact", path: "dist" },
        },
      ],
    });

    workflow.addJob("force_release_golang", {
      name: "Publish to Github Go Repository",
      needs: ["force-release"],
      runsOn: workflowRunsOn,
      permissions: {
        contents: JobPermission.READ,
      },
      env: {
        CI: "true",
      },
      steps: [
        {
          name: "Setup Node.js",
          uses: "actions/setup-node",
          with: {
            "node-version": project.minNodeVersion,
          },
        },
        {
          name: "Setup Go",
          uses: "actions/setup-go",
          with: { "go-version": "^1.16.0" },
        },
        {
          name: "Download build artifacts",
          uses: "actions/download-artifact",
          with: { name: "build-artifact", path: "dist" },
        },
        {
          name: "Restore build artifact permissions",
          run: "cd dist && setfacl --restore=permissions-backup.acl",
          continueOnError: true,
        },
        {
          name: "Prepare Repository",
          run: "mv dist .repo",
        },
        {
          name: "Install Dependencies",
          run: "cd .repo && yarn install --check-files --frozen-lockfile",
        },
        {
          name: "Create Artifact",
          run: "cd .repo && npx projen package:go",
        },
        {
          name: "Setup Copywrite tool",
          uses: "hashicorp/setup-copywrite",
        },
        {
          name: "Copy copywrite hcl file",
          run: "cp .repo/.copywrite.hcl .repo/dist/go/.copywrite.hcl",
        },
        {
          name: "Add headers using Copywrite tool",
          run: "cd .repo/dist/go && copywrite headers",
        },
        {
          name: "Remove copywrite hcl file",
          run: "rm -f .repo/dist/go/.copywrite.hcl",
        },
        {
          name: "Remove some text from the README that doesn't apply to Go",
          run: [
            "sed -i 's/# CDKTF prebuilt bindings for/# CDKTF Go bindings for/' .repo/dist/go/*/README.md",
            // @see https://stackoverflow.com/a/49511949
            "sed -i -e '/## Available Packages/,/### Go/!b' -e '/### Go/!d;p; s/### Go/## Go Package/' -e 'd' .repo/dist/go/*/README.md",
            // sed -e is black magic and for whatever reason the string replace doesn't work so let's try it again:
            "sed -i 's/### Go/## Go Package/' .repo/dist/go/*/README.md",
            // Just straight up delete these full lines and everything in between them:
            "sed -i -e '/API.typescript.md/,/You can also visit a hosted version/!b' -e 'd' .repo/dist/go/*/README.md",
            `sed -i 's|Find auto-generated docs for this provider here:|Find auto-generated docs for this provider [here](https://${options.repositoryUrl}/blob/main/docs/API.go.md).|' .repo/dist/go/*/README.md`,
            // Just straight up delete these full lines and everything in between them:
            "sed -i -e '/### Provider Version/,/The provider version can be adjusted/!b' -e 'd' .repo/dist/go/*/README.md",
          ].join("\n"),
          continueOnError: true,
        },
        {
          name: "Copy the README file to the parent directory",
          run: "cp .repo/dist/go/*/README.md .repo/dist/go/README.md",
        },
        {
          name: "Collect go Artifact",
          run: "mv .repo/dist dist",
        },
        {
          name: "Release",
          if: "${{ inputs.publish_to_go }}",
          env: {
            GIT_USER_NAME: "CDK for Terraform Team",
            GIT_USER_EMAIL: "github-team-tf-cdk@hashicorp.com",
            GITHUB_TOKEN: "${{ secrets.GO_GITHUB_TOKEN }}",
          },
          run: "npx -p publib@latest publib-golang",
        },
      ],
    });
  }
}
