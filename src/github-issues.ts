/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk, FileBase, FileBaseOptions, IResolver, Project } from "projen";

interface GithubIssuesConfig {
  providerName: string;
}

/**
 * creates files in .github/ISSUE_TEMPLATE to configure user guidance to create issues
 */
export class GithubIssues {
  constructor(project: cdk.JsiiProject, config: GithubIssuesConfig) {
    new IssueConfigFile(project, ".github/ISSUE_TEMPLATE/config.yml", config);
  }
}

interface IssueConfigFileOptions extends FileBaseOptions {
  providerName: string;
}

class IssueConfigFile extends FileBase {
  protected readonly options: IssueConfigFileOptions;

  constructor(
    project: Project,
    filePath: string,
    options: IssueConfigFileOptions
  ) {
    super(project, filePath, options);
    this.options = options;
  }

  protected synthesizeContent(resolver: IResolver) {
    const { providerName } = resolver.resolve(
      this.options
    ) as IssueConfigFileOptions;

    return `blank_issues_enabled: false
contact_links:
  - name: File an issue
    url: "https://github.com/hashicorp/terraform-cdk/issues/new?labels=bug%2C+new%2C+pre-built+providers&template=bug-report-prebuilt-providers.md&title=\`${providerName}\`+provider:+"
    about: Please file issues with pre-built providers in our main repository.
`;
  }
}
