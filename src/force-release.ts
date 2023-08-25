/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";

interface ForceReleaseOptions {
  workflowRunsOn: string[];
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
          with: { "node-version": "16.14.0" },
        },
        {
          name: "Install dependencies",
          run: "yarn install --check-files --frozen-lockfile",
        },
        { name: "release", run: "npx projen release" },
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
          with: { "node-version": "16.14.0" },
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
