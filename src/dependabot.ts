/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk, FileBase } from "projen";

export class Dependabot {
  constructor(project: cdk.JsiiProject) {
    new DependabotConfigFile(project, ".github/dependabot.yml");
  }
}

class DependabotConfigFile extends FileBase {
  protected synthesizeContent() {
    return `# NOTE: Dependabot configuration is not managed by Projen because if you enable Dependabot through Projen,
# it will delete the upgrade-main job and expect you to only use Dependabot for updates.
# That is not what we want either; we just want to use Dependabot for security updates.

version: 2
updates:
  - package-ecosystem: npm
    versioning-strategy: lockfile-only
    directory: /
    schedule:
      interval: daily
    ignore:
      - dependency-name: projen
    labels:
      - auto-approve
      - automerge
      - dependencies
      - security
    # Disable version updates for npm dependencies, only use Dependabot for security updates
    open-pull-requests-limit: 0
`;
  }
}
