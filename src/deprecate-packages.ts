/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { JsiiProject } from "projen/lib/cdk";
import { JobPermission, JobStep } from "projen/lib/github/workflows-model";
import { PackageInfo } from "./package-info";

export interface DeprecatePackagesOptions {
  providerName: string;
  packageInfo: PackageInfo;
  isDeprecated: boolean;
}

export class DeprecatePackages {
  constructor(project: JsiiProject, options: DeprecatePackagesOptions) {
    const { providerName, packageInfo, isDeprecated } = options;

    const deprecationMessageForNPM = [
      `See https://cdk.tf/imports for details on how to continue to use the ${providerName} provider`,
      `in your CDK for Terraform (CDKTF) projects by generating the bindings locally.`,
    ].join(" ");
    // @see https://github.com/golang/go/issues/40357
    const deprecationMessageForGo = [
      `// Deprecated: HashiCorp is no longer publishing new versions of the prebuilt provider for ${providerName}.`,
      `// Previously-published versions of this prebuilt provider will still continue to be available as installable Go modules,`,
      `// but these will not be compatible with newer versions of CDK for Terraform and are not eligible for commercial support.`,
      `// You can continue to use the ${providerName} provider in your CDK for Terraform projects with newer versions of CDKTF,`,
      `// but you will need to generate the bindings locally. See https://cdk.tf/imports for details.`,
      ``,
    ].join("\\n");

    const deprecationStep: JobStep = {
      name: "Mark the Go module as deprecated",
      run: `find '.repo/dist/go' -mindepth 2 -maxdepth 4 -type f -name 'go.mod' | xargs sed -i '1s|^|${deprecationMessageForGo}|'`,
    };
    if (isDeprecated) {
      packageInfo.publishToGo?.prePublishSteps?.splice(-1, 0, deprecationStep);
    }

    const releaseWorkflow = project.github?.tryFindWorkflow("release");
    if (!releaseWorkflow) {
      throw new Error("Could not find release workflow, aborting");
    }

    releaseWorkflow.addJobs({
      deprecate: {
        name: "Deprecate the package in package managers if needed",
        runsOn: ["ubuntu-latest"],
        needs: ["release", "release_npm"],
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
          },
          {
            name: "Install",
            run: "yarn install",
          },
          {
            name: "Check deprecation status",
            id: "check_status",
            run: [
              `IS_DEPRECATED=$(npm pkg get cdktf.isDeprecated | tr -d '"')`,
              `echo "is_deprecated=$IS_DEPRECATED"`, // for easier debugging
              `echo "is_deprecated=$IS_DEPRECATED" >> $GITHUB_OUTPUT`,
            ].join("\n"),
          },
          {
            name: "Deprecate the package on NPM",
            if: "steps.check_status.outputs.is_deprecated",
            run: [
              'npm set "//$NPM_REGISTRY/:_authToken=$NPM_TOKEN"',
              `npm deprecate ${packageInfo.npm.name} "${deprecationMessageForNPM}"`,
            ].join("\n"),
            env: {
              NPM_REGISTRY: project.package.npmRegistry,
              NPM_TOKEN:
                "${{ secrets." + `${project.package.npmTokenSecret} }}`,
            },
          },
          // Unfortunately, PyPi has no mechanism to mark a package as deprecated: https://github.com/pypi/warehouse/issues/345
          // Maven also never moved past the proposal stage: https://github.com/p4em/artifact-deprecation
          // NuGet supports deprecation, but only via the web UI: https://learn.microsoft.com/en-us/nuget/nuget-org/deprecate-packages
          // Go deprecation is handled in the "Publish to Go" step (see line 37)
        ],
        permissions: {
          contents: JobPermission.READ,
        },
      },
    });
  }
}
