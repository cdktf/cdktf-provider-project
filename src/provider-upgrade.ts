import { NodeProject, GithubWorkflow } from 'projen';

/**
 * Checks for new versions of projen and creates a PR with an upgrade change.
 */
export class ProviderUpgrade {
  constructor(project: NodeProject) {
    const workflow = new GithubWorkflow(project, 'ProviderUpgrade');

    workflow.on({
      schedule: [ { cron: '30 20 * * *' } ], // 6am every day
      workflow_dispatch: {},               // allow manual triggering
    });

    workflow.addJobs({
      upgrade: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          ...project.workflowBootstrapSteps,

          // upgrade
          { run: 'yarn fetch' },

          // submit a PR
          {
            name: 'Create Pull Request',
            uses: 'peter-evans/create-pull-request@v3',
            with: {
              'commit-message': 'chore: upgrade provider',
              'branch': 'auto/provider-upgrade',
              'title': 'chore: upgrade provider',
              'body': 'This PR upgrades provider to the latest version',
            },
          },
        ],
      },
    });
  }
}