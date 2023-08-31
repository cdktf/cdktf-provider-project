/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { UpdateVersionFile } from "./scripts/update-version-file";

type VersionCompatibilityMatrixOptions = {
  underlyingTerraformProviderVersion: string;
  cdktfVersion: string;
};

export class VersionCompatibilityMatrix {
  constructor(
    project: cdk.JsiiProject,
    config: VersionCompatibilityMatrixOptions
  ) {
    const versionFileUpdateScript = new UpdateVersionFile(project, {
      underlyingTerraformProviderVersion:
        config.underlyingTerraformProviderVersion,
      cdktfVersion: config.cdktfVersion,
    });
    project.addTask("update-version-file", {
      exec: `node ./${versionFileUpdateScript.path}`,
    });
    project.buildWorkflow?.addPostBuildSteps({
      name: "changelog file",
      run: "cat dist/changelog.md",
    });
    project.buildWorkflow?.addPostBuildSteps({
      name: "Update Version Compatiblity File",
      run: "yarn update-version-file",
    });
  }
}
