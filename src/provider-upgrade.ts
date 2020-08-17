import { NodeProject, GithubWorkflow } from 'projen';

/**
 * Checks for new versions of the given provider and creates a PR with an upgrade change if there are changes.
 */
export class ProviderUpgrade {
  constructor(project: NodeProject) {
    const workflow = new GithubWorkflow(project, 'ProviderUpgrade');

    workflow.on({
      schedule: [ { cron: '0 */4 * * *' } ], // Run every 4 hours
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