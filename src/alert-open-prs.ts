/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";
import { generateRandomCron, Schedule } from "./util/random-cron";

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
      // run on weekdays sometime during working hours (8am-4pm UTC)
      schedule: [
        {
          cron: generateRandomCron({
            project,
            maxHour: 8,
            hourOffset: 8,
            schedule: Schedule.Weekdays,
          }),
        },
      ],
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
          uses: "slackapi/slack-github-action",
          with: {
            webhook: slackWebhookUrl,
            "webhook-type": "webhook-trigger",
            payload: JSON.stringify({
              pr_links:
                "${{ join(fromJSON(steps.old_prs.outputs.pr_links), ', ') }}",
            }),
          },
        },
      ],
      continueOnError: true, // this job fails sometimes due to Slack timeouts (503s and 504s) but it's really not a big deal if it does
    });
  }
}
