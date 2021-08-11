import { NodeProject } from 'projen';

/**
 * Checks for new versions of the given provider and creates a PR with an upgrade change if there are changes.
 */
export class AutoMerge {
  constructor(project: NodeProject) {
    const workflow = project.github?.addWorkflow('automerge');

    if (!workflow) throw new Error('no workflow defined');

    workflow.on({
      pull_request: {
        types: [
          'labeled',
          'unlabeled',
          'synchronize',
          'opened',
          'edited',
          'ready_for_review',
          'reopened',
          'unlocked',
        ],
      },
      pull_request_review: {
        types: ['submitted'],
      },
      check_suite: {
        types: ['completed'],
      },
      status: {},
    });

    workflow.addJobs({
      automerge: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          {
            name: 'automerge',
            uses: 'pascalgn/automerge-action@v0.14.2',
            env: {
              GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            },
          },
        ],
      },
    });
  }
}
