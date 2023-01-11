import { javascript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";

interface AutoCloseCommunityIssuesOptions {
  providerName: string;
}
/**
 * Automatically closes issues and PRs reported by non-collaborators since this isn't the right place for them.
 */
export class AutoCloseCommunityIssues {
  constructor(
    project: javascript.NodeProject,
    options: AutoCloseCommunityIssuesOptions
  ) {
    const { providerName } = options;
    const workflow = project.github?.addWorkflow("auto-close-community-issues");

    if (!workflow) throw new Error("no workflow defined");

    workflow.on({
      issues: {
        types: ["opened"],
      },
      pullRequest: {
        types: ["opened"],
      },
    });

    workflow.addJob("autoclose", {
      runsOn: ["ubuntu-latest"],
      permissions: {
        pullRequests: JobPermission.WRITE,
        issues: JobPermission.WRITE,
      },
      if: "github.event.issue.author_association != 'OWNER' && github.event.issue.author_association != 'MEMBER' && github.event.issue.author_association != 'COLLABORATOR'",
      steps: [
        {
          name: "Auto-close issues by non-collaborators",
          uses: "peter-evans/close-issue@v2",
          with: {
            "issue-number": "${{ github.event.issue.number }}",
            comment:
              `Hi there! 👋 We appreciate your interest, but this is probably not the right place. 
              All the code in this repository is auto-generated using 
              [cdktf-provider-project](https://github.com/cdktf/cdktf-provider-project) and 
              [cdktf-repository-manager](https://github.com/cdktf/cdktf-repository-manager) from the source 
              [Terraform provider](https://github.com/terraform-providers/terraform-provider-${providerName}). 
              If there are problems, they should be addressed in one of those 3 repositories, not here, 
              as any changes here will just get overwritten the next time there is an update upstream. 
              Please open a new issue or PR in one of those repos. In the meantime, I'll auto-close this. 
              Thanks!`.replace(/\s+/g, " "),
            "close-reason": "not_planned",
            labels: "invalid,wontfix",
          },
        },
      ],
    });
  }
}
