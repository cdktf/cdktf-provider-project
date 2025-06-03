/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
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
            type: "string",
            required: true,
            description: "The sha of the commit to release",
          },
          publish_to_npm: {
            type: "boolean",
            default: false,
            description: "Whether or not to publish to NPM",
          },
          publish_to_maven: {
            type: "boolean",
            default: false,
            description: "Whether or not to publish to Maven",
          },
          publish_to_pypi: {
            type: "boolean",
            default: false,
            description: "Whether or not to publish to PyPi",
          },
          publish_to_nuget: {
            type: "boolean",
            default: false,
            description: "Whether or not to publish to NuGet",
          },
          publish_to_go: {
            type: "boolean",
            default: false,
            description: "Whether or not to publish to Go",
          },
        },
      },
    });

    const releaseWorkflow = project.github?.tryFindWorkflow(
      "release"
    ) as GithubWorkflow;
    const releaseJobs: Array<{ [key: string]: any }> = (releaseWorkflow as any)
      .jobs;

    // Hacky way of doing a deep copy, otherwise the below modifies the regular release workflow as well
    for (const [jobName, job] of Object.entries(
      JSON.parse(JSON.stringify(releaseJobs))
    )) {
      if (jobName === "deprecate") {
        continue; // skip it
      }
      if (jobName === "release") {
        // I clearly am not a developer anymore because I cannot remember how types work, hence all the (any) usage
        (job as any)["runs-on"] = workflowRunsOn;
        delete (job as any).outputs.latest_commit;

        const gitCheckoutStep = (job as any).steps.find(
          (it: any) => it.name === "Checkout"
        );
        gitCheckoutStep.with.ref = "${{ inputs.sha }}";

        const releaseStep = (job as any).steps.find(
          (it: any) => it.name === "release"
        );
        releaseStep.run = "npx projen unconditional-release";

        const backupStep = (job as any).steps.find(
          (it: any) => it.name === "Backup artifact permissions"
        );
        delete backupStep.if;

        const uploadArtifactStep = (job as any).steps.find(
          (it: any) => it.name === "Upload artifact"
        );
        delete uploadArtifactStep.if;

        const gitRemoteStep = (job as any).steps.findIndex(
          (it: any) => it.id === "git_remote"
        );
        (job as any).steps.splice(gitRemoteStep, 1);

        workflow.addJob(jobName, job as any);
      }
    }

    const publishJobs: Array<{ [key: string]: any }> = (
      project.release?.publisher as any
    )._renderJobsForBranch("main", {
      workflowName: "force-release",
    });

    for (const [jobName, job] of Object.entries(publishJobs)) {
      job["runs-on"] = workflowRunsOn;

      if (jobName === "release_github") {
        job.needs = ["release"];
        job.if = "needs.release.outputs.tag_exists != 'true'";
        const releaseStep = (job as any).steps.find(
          (it: any) => it.name === "Release"
        );
        releaseStep.env.GITHUB_REF = "${{ inputs.sha }}";
      }
      if (jobName === "release_npm") {
        job.if = "${{ inputs.publish_to_npm }}";
      }
      if (jobName === "release_maven") {
        job.if = "${{ inputs.publish_to_maven }}";
        const releaseStep = (job as any).steps.find(
          (it: any) => it.name === "Release"
        );
        // I couldn't find a better way to do this so this is manually c&ped from /src/index.ts line 389
        releaseStep.env.MAVEN_OPTS =
          "--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED";
      }
      if (jobName === "release_pypi") {
        job.if = "${{ inputs.publish_to_pypi }}";
      }
      if (jobName === "release_nuget") {
        job.if = "${{ inputs.publish_to_nuget }}";
      }
      if (jobName === "release_golang") {
        job.if = "${{ inputs.publish_to_go }}";
      }

      // Delete the steps that create a new GitHub issue for a failed release
      job.steps.splice(job.steps.length - 2, 2);

      workflow.addJob(jobName, job as any);
    }
  }
}
