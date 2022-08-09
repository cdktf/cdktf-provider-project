import { cdk } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";

const PULL_REQUEST_REF = "${{ github.event.pull_request.head.ref }}";
const PULL_REQUEST_REPOSITORY =
  "${{ github.event.pull_request.head.repo.full_name }}";

export class NextVersionPr {
  constructor(project: cdk.JsiiProject, githubSecret: string) {
    const workflow = new GithubWorkflow(
      project.github!,
      "next-cdktf-version-pr"
    );
    workflow.on({ workflowDispatch: {} });
    workflow.addJob("pr-against-next", {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        pullRequests: JobPermission.WRITE,
      },
      env: {
        CI: "true",
        CHECKPOINT_DISABLE: "1",
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v3",
          with: {
            ref: PULL_REQUEST_REF,
            repository: PULL_REQUEST_REPOSITORY,
          },
        },
        {
          name: "Remove old PR",
          run: [
            `PR_NUMBER_TO_CLOSE=$(gh pr list | grep "cdktf-next-pr" | awk '{ print $1 }')`,
            `if [ -z "$PR_NUMBER_TO_CLOSE" ]; then`,
            `  echo "No PR to close"`,
            `else`,
            `  gh pr close $PR_NUMBER_TO_CLOSE`,
            `fi`,
          ].join("\n"),
          env: {
            GH_TOKEN: githubSecret,
          },
        },
        {
          name: "Install",
          run: "yarn install",
        },
        {
          name: "Upgrade CDKTF",
          // Replace 'cdktfVersion: "0.12.0"' with 'cdktfVersion: "<next>"'
          run: [
            // We need this to get the full tag of the @next version
            `CDKTF_VERSION=$(yarn info cdktf --json | jq -r '.data | .["dist-tags"] | .next')`,
            `sed -i "s/cdktfVersion: \".*\",/cdktfVersion: \\"$CDKTF_VERSION\\",/" .projenrc.js`,
            `cat .projenrc.js`,
          ].join("\n"),
        },
        {
          name: "Run projen",
          run: "yarn run upgrade",
        },
        {
          name: "Regenerate bindings",
          run: "npx cdktf get",
        },
        {
          name: "Create PR",
          uses: "peter-evans/create-pull-request@v4",
          with: {
            token: githubSecret,
            branch: "cdktf-next-pr",
            "branch-suffix": "random",
            "commit-message": "chore: upgrade CDKTF to @next preview version",
            title: "chore: preview upgrading CDKTF to @next version",
            "delete-branch": true,
            draft: true,
          },
        },
      ],
    });
  }
}
