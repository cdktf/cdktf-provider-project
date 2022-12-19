import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";

const DEFAULT_MAX_HOURS_OPEN = 2;

interface AlertOpenPrsOptions {
  maxHoursOpen?: number;
  slackWebhookUrl: string;
  repository: string;
}

export class AlertOpenPrs {
  constructor(project: cdk.JsiiProject, options: AlertOpenPrsOptions) {
    const {
      maxHoursOpen = DEFAULT_MAX_HOURS_OPEN,
      slackWebhookUrl,
      repository,
    } = options;

    const workflow = new GithubWorkflow(project.github!, "alert-open-prs");
    workflow.on({
      workflowDispatch: {},
      schedule: [{ cron: "* */12 * * 1-5" }], // every 12 hours, Monday-Friday
    });
    workflow.addJob("check-open-prs", {
      runsOn: ["ubuntu-latest"],
      permissions: {
        pullRequests: JobPermission.READ,
      },
      env: {},
      steps: [
        {
          name: "Find old PRs",
          id: "old_prs",
          run: [
            `PR_LINKS=$(gh pr list --state open --repo="${repository}" --search "created:<$(date -d '-${maxHoursOpen}hours' +%FT%TZ)" --json url --jq "map(.url)" )`,
            `if [ "$PR_LINKS" == "[]" ]; then`,
            `  echo "No PRs open for more than ${maxHoursOpen} hour(s)"`,
            `else`,
            `  echo "pr_links=$PR_LINKS" >> $GITHUB_OUTPUT`,
            `fi`,
          ].join("\n"),
          env: { GH_TOKEN: "${{ github.token }}" },
        },
        {
          name: "Alert Slack on old PRs",
          if: "${{ steps.old_prs.outputs.pr_links }}",
          uses: "slackapi/slack-github-action@v1.23.0",
          with: {
            payload: JSON.stringify({
              pr_links:
                "${{ join(fromJSON(steps.old_prs.outputs.pr_links), ', ') }}",
            }),
          },
          env: { SLACK_WEBHOOK_URL: slackWebhookUrl },
        },
      ],
    });
  }
}
